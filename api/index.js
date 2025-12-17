import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import qs from 'qs';

const app = express();

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

app.get('/api/hello', (req, res) => {
    res.json({ status: "ok", message: "Backend is reachable" });
});

app.post('/api/login', async (req, res) => {
    const { uid, password } = req.body;
    if (!uid || !password) return res.status(400).json({ success: false, message: 'Missing Credentials' });

    const jar = new CookieJar();
    // 1. TIMEOUT SETTING: Set to 9s to fail gracefully before Vercel kills us at 10s
    const client = wrapper(axios.create({ 
        jar,
        timeout: 9000, 
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }));

    try {
        console.log(`[AUTH] Logging in ${uid}...`);
        
        // --- 1. LOGIN ---
        const loginPayload = qs.stringify({
            txtAN: uid, txtSK: password, txtPageAction: '1', _tries: '1', _md5: '',
            login: 'iamalsouser', passwd: 'haveaniceday', _save: 'Log In'
        });

        const loginResp = await client.post(URLS.LOGIN, loginPayload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Redirect check logic
        if (loginResp.request.res && loginResp.request.res.responseUrl && loginResp.request.res.responseUrl.includes('youLogin.jsp')) {
            return res.status(401).json({ success: false, message: 'Invalid Credentials (Redirect Check)' });
        }
        
        // Double check using cheerio title if URL didn't update (sometimes happens in node)
        const $login = cheerio.load(loginResp.data);
        if ($login('input[name="txtSK"]').length > 0) {
             return res.status(401).json({ success: false, message: 'Invalid Credentials' });
        }

        console.log('[AUTH] Success. Scraping modules...');

        // --- 2. SELECTIVE PARALLEL SCRAPING ---
        // Vercel Free tier has 10s limit. Fetching 7 pages + Login might hit that if the college server is slow.
        // We catch errors per-request so one failure doesn't crash the whole login.
        
        const fetchSafe = async (url) => {
            try { return await client.get(url); } catch (e) { return { data: '' }; }
        };

        const [hourly, profile, subjects, att, internal, exam, due, paid] = await Promise.all([
            fetchSafe(URLS.HOURLY),
            fetchSafe(URLS.PROFILE),
            fetchSafe(URLS.SUBJECTS),
            fetchSafe(URLS.ATTENDANCE),
            fetchSafe(URLS.INTERNALS),
            fetchSafe(URLS.EXAMS),
            fetchSafe(URLS.FEE_DUE),
            fetchSafe(URLS.FEE_PAID)
        ]);

        // --- PARSING ---
        // (Copy parsing logic exactly as before, assuming empty strings if request failed)
        
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

        // 7. Fees - Due
        const $due = cheerio.load(due.data);
        const dueList = [];
        $due('table tr').each((i, row) => {
            const cols = $due(row).find('td');
            if (cols.length >= 4) {
                const type = $due(cols[0]).text().trim();
                const amt = $due(cols[3]).text().trim();
                // Filter actual due rows by ensuring Amount has decimal pattern
                if (amt.match(/[\d,]+\.\d{2}/) && !type.includes('Total')) {
                    dueList.push({
                        head: $due(cols[1]).text().trim(),
                        dueDate: $due(cols[2]).text().trim(),
                        amount: parseFloat(amt.replace(/,/g, '')) || 0
                    });
                }
            }
        });
        const dueTotal = dueList.reduce((acc, curr) => acc + curr.amount, 0);

        // 8. Fees - Paid
        const $paid = cheerio.load(paid.data);
        const paidHistory = [];
        $paid('table tr').each((i, row) => {
            const cols = $paid(row).find('td');
            if (cols.length >= 4) {
                const date = $paid(cols[0]).text().trim();
                if (date.match(/\d{2}\/\d{2}\/\d{4}/)) { // Validate date format
                    const amtStr = $paid(cols[3]).text().trim();
                    paidHistory.push({
                        date: date,
                        mode: $paid(cols[1]).text().trim(),
                        number: $paid(cols[2]).text().trim(),
                        amount: parseFloat(amtStr.replace(/,/g, '')) || 0
                    });
                }
            }
        });
        const paidTotal = paidHistory.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            success: true,
            data: { 
                profile: profileData, hourly: hourlyData, subjects: subjectsData, 
                attendance: attendanceData, internals: internalData, exams: examData,
                fees: { 
                    due: { list: dueList, totalDue: dueTotal }, 
                    paid: { history: paidHistory, totalPaid: paidTotal } 
                }
            }
        });

    } catch (e) {
        console.error("SCRAPE_ERROR:", e.message);
        const msg = e.message.includes('timeout') 
            ? 'College server timeout (Try again)' 
            : 'Internal connection error';
        res.status(500).json({ success: false, message: msg, error: e.message });
    }
});

// Vercel Serverless entry point logic
// This effectively exports the Express app handler
export default app;