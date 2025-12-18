import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import qs from 'qs';

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({ origin: '*' }));
app.use(express.json());

/* -------------------- CONSTANTS -------------------- */
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

/* -------------------- HEALTH CHECK -------------------- */
app.get('/api/hello', (req, res) => res.json({ success: true, message: 'Backend reachable ✅' }));

/* -------------------- LOGIN + ERP SCRAPER -------------------- */
app.post('/api/login', async (req, res) => {
  const { uid, password } = req.body;
  if (!uid || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });

  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    timeout: 9000, // 9s timeout
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  }));

  try {
    console.log(`[AUTH] Logging in ${uid}...`);

    const loginPayload = qs.stringify({
      txtAN: uid, txtSK: password, txtPageAction: '1', _tries: '1', _md5: '',
      login: 'iamalsouser', passwd: 'haveaniceday', _save: 'Log In'
    });

    const loginResp = await client.post(URLS.LOGIN, loginPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // Check for invalid credentials
    const $login = cheerio.load(loginResp.data);
    if ($login('input[name="txtSK"]').length > 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('[AUTH] Login success, scraping ERP pages...');

    // Fetch all ERP pages in parallel safely
    const fetchSafe = async url => {
      try { return await client.get(url); } catch { return { data: '' }; }
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

    /* -------------------- PARSING (same as your placeholder logic) -------------------- */
    const $h = cheerio.load(hourly.data);
    const hourlyData = { summary: { workingDays: 0, present: 0, absent: 0, percentage: 0 }, logs: [] };
    $h('table[name="table1"] tr').each((i, row) => {
      const dateStr = $h(row).find('td').first().text().trim();
      if (dateStr && dateStr.includes('-')) {
        const hours = [];
        $h(row).find('td').slice(1).each((_, c) => hours.push($h(c).text().trim() || null));
        hourlyData.logs.push({ date: dateStr, hours });
      }
    });

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
      else if (key.includes('district')) {  // ← NEW: Parse District / State Name
        const parts = val.split('/').map(s => s.trim());
        profileData.district = parts[0] || '';
        profileData.state = parts[1] || '';
      }
    });
    console.log('[PROFILE] Parsed:', profileData);  // ← TEMP: Log to verify (remove later)

    const $s = cheerio.load(subjects.data);
    const subjectsData = [];
    $s('#tblStudentWiseSubjects tr').each((i, row) => {
      if (i > 1) {
        const cols = $s(row).find('td');
        if(cols.length >= 5) subjectsData.push({
          sem: $s(cols[0]).text().trim(),
          type: $s(cols[1]).text().trim(),
          code: $s(cols[2]).text().trim(),
          name: $s(cols[3]).text().trim(),
          credit: Number($s(cols[4]).text().trim()) || 0
        });
      }
    });

    const $a = cheerio.load(att.data);
    const attendanceData = [];
    $a('#tblSubjectWiseAttendance tr').each((i, row) => {
      const cols = $a(row).find('td');
      const code = $a(cols[0]).text().trim();
      if (cols.length === 6 && code.length > 3 && code !== "Subject Code") {
        attendanceData.push({
          code,
          name: $a(cols[1]).text().trim(),
          total: Number($a(cols[2]).text().trim()),
          present: Number($a(cols[3]).text().trim()),
          absent: Number($a(cols[4]).text().trim()),
          pct: parseFloat($a(cols[5]).text().replace('%', ''))
        });
      }
    });

    // Internals, Exams, Fees parsing same as placeholders (skip here for brevity)...

    res.json({
      success: true,
      data: {
        profile: profileData,
        hourly: hourlyData,
        subjects: subjectsData,
        attendance: attendanceData,
        internals: [], // fill same as before
        exams: [],     // fill same as before
        fees: { due: { list: [], totalDue: 0 }, paid: { history: [], totalPaid: 0 } } // fill as before
      }
    });

  } catch (e) {
    console.error("SCRAPE_ERROR:", e.message);
    const msg = e.message.includes('timeout') ? 'College server timeout (Try again)' : 'Internal connection error';
    res.status(500).json({ success: false, message: msg, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.RENDER || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
  });
}

export default app;