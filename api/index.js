const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const qs = require('qs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const BASE_URL = 'http://202.160.160.58:8080/lastudentportal';
const URLS = {
    LOGIN: `${BASE_URL}/students/loginManager/youLogin.jsp`,
    HOURLY: `${BASE_URL}/students/report/studentHourWiseAttendance.jsp`,
    PROFILE: `${BASE_URL}/students/report/studentProfile.jsp`,
    SUBJECTS: `${BASE_URL}/students/report/studentWiseSubjects.jsp`,
    ATTENDANCE: `${BASE_URL}/students/report/studentSubjectWiseAttendance.jsp`,
    INTERNALS: `${BASE_URL}/students/report/studentInternalMarkDetails.jsp`,
    EXAMS: `${BASE_URL}/students/report/studentExamResultsDetails.jsp`,
    FEE_DUE: `${BASE_URL}/students/report/studentFeeDueDetails.jsp`,
    FEE_PAID: `${BASE_URL}/students/report/studentFinanceDetails.jsp`
};

// --- HEALTH CHECK ROUTE ---
// Go to your-app.vercel.app/api/hello to verify backend is running
app.get('/api/hello', (req, res) => {
    res.json({ status: "ok", message: "Vercel API is functioning" });
});

app.post('/api/login', async (req, res) => {
    const { uid, password } = req.body;
    // ... (Keep your exact Login scraping logic here, NO changes needed to logic) ...
    // COPY PASTE THE LOGIC FROM THE PREVIOUS MESSAGE INSIDE THIS BLOCK
    // START COPY
    if (!uid || !password) return res.status(400).json({ success: false, message: 'Missing Credentials' });

    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    try {
        console.log(`[AUTH] Logging in ${uid}...`);
        const loginPayload = qs.stringify({
            txtAN: uid, txtSK: password, txtPageAction: '1', _tries: '1', _md5: '',
            login: 'iamalsouser', passwd: 'haveaniceday', _save: 'Log In'
        });

        const loginResp = await client.post(URLS.LOGIN, loginPayload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (loginResp.request.res.responseUrl.includes('youLogin.jsp')) {
            return res.status(401).json({ success: false, message: 'Invalid Credentials' });
        }

        console.log('[AUTH] Success. Scraping ALL modules...');

        const [hourly, profile, subjects, att, internal, exam, due, paid] = await Promise.all([
            client.get(URLS.HOURLY),
            client.get(URLS.PROFILE),
            client.get(URLS.SUBJECTS),
            client.get(URLS.ATTENDANCE),
            client.get(URLS.INTERNALS),
            client.get(URLS.EXAMS),
            client.get(URLS.FEE_DUE),
            client.get(URLS.FEE_PAID)
        ]);

        // 1. Hourly Stats
        const $h = cheerio.load(hourly.data);
        const hourlyData = {
            summary: {
                workingDays: Number($h('#hdnWorkingDays').val()) || 0,
                present: Number($h('#hdnHrsPresent').val()) || 0,
                absent: Number($h('#hdnHrsAbsent').val()) || 0,
                percentage: parseFloat($h('#hdnPresentPercentage').val()) || 0,
            },
            logs: []
        };
        $h('table[name="table1"] tr').each((i, row) => {
            const dateStr = $h(row).find('td').first().text().trim();
            if (dateStr && dateStr.includes('-')) {
                const hours = [];
                $h(row).find('td').slice(1).each((j, c) => hours.push($h(c).text().trim() || null));
                hourlyData.logs.push({ date: dateStr, hours });
            }
        });

        // 2. Profile
        const $p = cheerio.load(profile.data);
        const profileData = {};
        $p('table.maintable tr').each((i, row) => {
            const key = $p(row).find('td').first().text().toLowerCase();
            const val = $p(row).find('td').last().text().trim();
            if(key.includes('name') && !key.includes('father')) profileData.name = val;
            else if(key.includes('register')) profileData.regNo = val;
            else if(key.includes('course')) profileData.course = val;
            else if(key.includes('semester')) profileData.sem = val;
            else if(key.includes('institution')) profileData.institution = val;
            else if(key.includes('father')) profileData.father = val;
            else if(key.includes('contact') && key.includes('student')) profileData.contact = val;
            else if(key.includes('residential')) profileData.address = val;
        });

        // 3. Subjects
        const $s = cheerio.load(subjects.data);
        const subjectsData = [];
        $s('#tblStudentWiseSubjects tr').each((i, row) => {
            if(i > 1) { 
                const cols = $s(row).find('td');
                if(cols.length >= 5) {
                    subjectsData.push({
                        sem: $s(cols[0]).text().trim(),
                        type: $s(cols[1]).text().trim(),
                        code: $s(cols[2]).text().trim(),
                        name: $s(cols[3]).text().trim(),
                        credit: Number($s(cols[4]).text().trim()) || 0
                    });
                }
            }
        });

        // 4. Attendance
        const $a = cheerio.load(att.data);
        const attendanceData = [];
        $a('#tblSubjectWiseAttendance tr').each((i, row) => {
            const cols = $a(row).find('td');
            const code = $a(cols[0]).text().trim();
            if(cols.length === 6 && code.length > 3 && code !== "Subject Code") {
                attendanceData.push({
                    code: code,
                    name: $a(cols[1]).text().trim(),
                    total: Number($a(cols[2]).text().trim()),
                    present: Number($a(cols[3]).text().trim()),
                    absent: Number($a(cols[4]).text().trim()),
                    pct: parseFloat($a(cols[5]).text().replace('%', ''))
                });
            }
        });

        // 5. Internals
        const $i = cheerio.load(internal.data);
        const internalData = [];
        $i('table tr').each((i, row) => {
            const cols = $i(row).find('td');
            if(cols.length >= 4) {
               const code = $i(cols[0]).text().trim();
               if (code.match(/[A-Z0-9]{5,}/) && !code.includes('Subject')) {
                   internalData.push({
                       code: code,
                       name: $i(cols[1]).text().trim(),
                       obtained: parseFloat($i(cols[2]).text().trim()) || 0,
                       max: parseFloat($i(cols[3]).text().trim()) || 0
                   });
               }
            }
        });

        // 6. Exams
        const $e = cheerio.load(exam.data);
        const examData = [];
        $e('table tr').each((i, row) => {
            const cols = $e(row).find('td');
            if(cols.length >= 8) {
                const code = $e(cols[4]).text().trim();
                if(code.match(/[A-Z0-9]{5,}/)) {
                    examData.push({
                        sem: $e(cols[0]).text().trim(),
                        month: $e(cols[1]).text().trim(),
                        part: $e(cols[2]).text().trim(),
                        code: code,
                        name: $e(cols[5]).text().trim(),
                        credit: Number($e(cols[6]).text().trim()) || 0,
                        point: Number($e(cols[7]).text().trim()) || 0,
                        grade: $e(cols[8]).text().trim(),
                        result: $e(cols[9]) ? $e(cols[9]).text().trim() : "PASS"
                    });
                }
            }
        });

        // 7. Fee Due
        const $due = cheerio.load(due.data);
        const dueData = { list: [], totalDue: 0 };
        $due('table tr').each((i, row) => {
            const cols = $due(row).find('td');
            if (cols.length >= 4) {
                const type = $due(cols[0]).text().trim();
                const amountText = $due(cols[3]).text().trim();
                if (type.length > 5 && amountText.match(/[\d,]+\.\d{2}/)) {
                    dueData.list.push({
                        head: $due(cols[1]).text().trim(),
                        dueDate: $due(cols[2]).text().trim(),
                        amount: parseFloat(amountText.replace(/,/g, '')) || 0
                    });
                }
            }
        });
        dueData.totalDue = dueData.list.reduce((acc, curr) => acc + curr.amount, 0);

        // 8. Fee Paid
        const $paid = cheerio.load(paid.data);
        const paidData = { history: [], totalPaid: 0 };
        $paid('table tr').each((i, row) => {
            const cols = $paid(row).find('td');
            if (cols.length >= 4) {
                const date = $paid(cols[0]).text().trim();
                if (date.match(/\d{2}\/\d{2}\/\d{4}/)) {
                    const amtStr = $paid(cols[3]).text().trim();
                    paidData.history.push({
                        date: date,
                        mode: $paid(cols[1]).text().trim(),
                        number: $paid(cols[2]).text().trim(),
                        amount: parseFloat(amtStr.replace(/,/g, '')) || 0
                    });
                }
            }
        });
        paidData.totalPaid = paidData.history.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            success: true,
            data: { 
                profile: profileData, hourly: hourlyData, subjects: subjectsData, 
                attendance: attendanceData, internals: internalData, exams: examData,
                fees: { due: dueData, paid: paidData }
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
    // END COPY
});

// Vercel Serverless Function Handling
if (require.main === module) {
    app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
}

module.exports = app;