/**
 * GREEN ENERGY CHALLENGE - Google Apps Script Backend
 * Developed for Krakatau Chandra Energi (KCE)
 * 
 * Modular, secure, and production-ready server-side controller.
 * Manages Google Sheets database, authentication, question bank, 
 * participant records, server-side answer verification, and live leaderboards.
 */

// Configuration Constants
const SPREADSHEET_ID_PROPERTY = 'KCE_SPREADSHEET_ID';
const ADMIN_PASSWORD_DEFAULT = 'KCEgreen2026!';

/**
 * Serves the Web App HTML interface.
 * Handles routing between main player game (Index.html) and Admin Dashboard (Admin.html).
 */
function doGet(e) {
  const page = (e && e.parameter && e.parameter.p) ? e.parameter.p.toLowerCase() : 'game';
  
  let output;
  if (page === 'admin') {
    try {
      output = HtmlService.createTemplateFromFile('Admin').evaluate();
    } catch(err) {
      output = HtmlService.createHtmlOutputFromFile('Admin');
    }
  } else {
    // 1. Try serving pre-bundled HTML directly (fastest, avoids template parse overhead)
    // 2. Fall back to template evaluation if modular files (Index.html + include) are used
    try {
      output = HtmlService.createHtmlOutputFromFile('index');
    } catch(e1) {
      try {
        output = HtmlService.createHtmlOutputFromFile('Index');
      } catch(e2) {
        try {
          output = HtmlService.createTemplateFromFile('index').evaluate();
        } catch(e3) {
          output = HtmlService.createTemplateFromFile('Index').evaluate();
        }
      }
    }
  }
  
  return output
    .setTitle('Green Energy Challenge | PT Krakatau Chandra Energi (KCE)')
    .setFaviconUrl('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3CclipPath%20id%3D%22g%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2230%22%2F%3E%3C%2FclipPath%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2230%22%20fill%3D%22%23FFFFFF%22%2F%3E%3Cg%20clip-path%3D%22url(%23g)%22%3E%3Cpath%20d%3D%22M%20-2%2015.3%20Q%202.5%2016.1%207%2018.1%20Q%2011.5%2018.6%2016%2018.9%20Q%2020.5%2018.7%2025%2017.1%20Q%2029.5%2016.3%2034%2014.2%20Q%2038.5%2013.7%2043%2013%20Q%2047.5%2013.1%2052%2014.5%20Q%2059%2016.1%2061%2017.4%20Q%2063.5%2017.5%2066%2018.6%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2211%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2028.5%20Q%202.5%2028.8%207%2028.8%20Q%2011.5%2028.4%2016%2026.5%20Q%2020.5%2025.7%2025%2023.8%20Q%2029.5%2023.3%2034%2023.1%20Q%2038.5%2023.4%2043%2025.1%20Q%2047.5%2025.8%2052%2027.9%20Q%2059%2028.8%2061%2029%20Q%2063.5%2029%2066%2028.3%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2211%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2038.5%20Q%202.5%2037.9%207%2035.4%20Q%2011.5%2034.5%2016%2032.4%20Q%2020.5%2032%2025%2032.3%20Q%2029.5%2032.8%2034%2035.1%20Q%2038.5%2036%2043%2038.3%20Q%2047.5%2038.8%2052%2038.9%20Q%2059%2037.9%2061%2036.4%20Q%2063.5%2036.3%2066%2034.4%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2214%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2047.1%20Q%202.5%2047.8%207%2048.9%20Q%2011.5%2049%2016%2048.1%20Q%2020.5%2047.5%2025%2045.3%20Q%2029.5%2044.6%2034%2043.2%20Q%2038.5%2043%2043%2043.6%20Q%2047.5%2044.2%2052%2046.3%20Q%2059%2047.7%2061%2048.7%20Q%2063.5%2048.7%2066%2049%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2211%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2058%20Q%202.5%2057.9%207%2056.6%20Q%2011.5%2055.9%2016%2053.7%20Q%2020.5%2053.1%2025%2052%20Q%2029.5%2052%2034%2053.1%20Q%2038.5%2053.7%2043%2055.9%20Q%2047.5%2056.6%2052%2057.9%20Q%2059%2057.9%2061%2057.2%20Q%2063.5%2057.2%2066%2055.9%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2211%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2064.6%20Q%202.5%2063.8%207%2061.7%20Q%2011.5%2061.2%2016%2060.5%20Q%2020.5%2060.6%2025%2062%20Q%2029.5%2062.7%2034%2064.9%20Q%2038.5%2065.5%2043%2066.5%20Q%2047.5%2066.5%2052%2065.3%20Q%2059%2063.9%2061%2062.5%20Q%2063.5%2062.4%2066%2061.1%22%20fill%3D%22none%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%2213%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2015.3%20Q%202.5%2016.1%207%2018.1%20Q%2011.5%2018.6%2016%2018.9%20Q%2020.5%2018.7%2025%2017.1%20Q%2029.5%2016.3%2034%2014.2%20Q%2038.5%2013.7%2043%2013%20Q%2047.5%2013.1%2052%2014.5%20Q%2059%2016.1%2061%2017.4%20Q%2063.5%2017.5%2066%2018.6%22%20fill%3D%22none%22%20stroke%3D%22%2347C1EA%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2028.5%20Q%202.5%2028.8%207%2028.8%20Q%2011.5%2028.4%2016%2026.5%20Q%2020.5%2025.7%2025%2023.8%20Q%2029.5%2023.3%2034%2023.1%20Q%2038.5%2023.4%2043%2025.1%20Q%2047.5%2025.8%2052%2027.9%20Q%2059%2028.8%2061%2029%20Q%2063.5%2029%2066%2028.3%22%20fill%3D%22none%22%20stroke%3D%22%233077B5%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2038.5%20Q%202.5%2037.9%207%2035.4%20Q%2011.5%2034.5%2016%2032.4%20Q%2020.5%2032%2025%2032.3%20Q%2029.5%2032.8%2034%2035.1%20Q%2038.5%2036%2043%2038.3%20Q%2047.5%2038.8%2052%2038.9%20Q%2059%2037.9%2061%2036.4%20Q%2063.5%2036.3%2066%2034.4%22%20fill%3D%22none%22%20stroke%3D%22%231E3A7A%22%20stroke-width%3D%2211%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2047.1%20Q%202.5%2047.8%207%2048.9%20Q%2011.5%2049%2016%2048.1%20Q%2020.5%2047.5%2025%2045.3%20Q%2029.5%2044.6%2034%2043.2%20Q%2038.5%2043%2043%2043.6%20Q%2047.5%2044.2%2052%2046.3%20Q%2059%2047.7%2061%2048.7%20Q%2063.5%2048.7%2066%2049%22%20fill%3D%22none%22%20stroke%3D%22%2347C1EA%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2058%20Q%202.5%2057.9%207%2056.6%20Q%2011.5%2055.9%2016%2053.7%20Q%2020.5%2053.1%2025%2052%20Q%2029.5%2052%2034%2053.1%20Q%2038.5%2053.7%2043%2055.9%20Q%2047.5%2056.6%2052%2057.9%20Q%2059%2057.9%2061%2057.2%20Q%2063.5%2057.2%2066%2055.9%22%20fill%3D%22none%22%20stroke%3D%22%233077B5%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M%20-2%2064.6%20Q%202.5%2063.8%207%2061.7%20Q%2011.5%2061.2%2016%2060.5%20Q%2020.5%2060.6%2025%2062%20Q%2029.5%2062.7%2034%2064.9%20Q%2038.5%2065.5%2043%2066.5%20Q%2047.5%2066.5%2052%2065.3%20Q%2059%2063.9%2061%2062.5%20Q%2063.5%2062.4%2066%2061.1%22%20fill%3D%22none%22%20stroke%3D%22%231E3A7A%22%20stroke-width%3D%2210%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Utility helper to include partial HTML files (CSS.html, JavaScript.html).
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Helper to get the active database spreadsheet.
 * If bound to a spreadsheet, uses getActiveSpreadsheet().
 * Otherwise, checks script properties or creates a new dedicated spreadsheet.
 */
function getDatabaseSpreadsheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    // Not container-bound
  }
  
  if (ss) return ss;
  
  const props = PropertiesService.getScriptProperties();
  const storedId = props.getProperty(SPREADSHEET_ID_PROPERTY);
  if (storedId) {
    try {
      ss = SpreadsheetApp.openById(storedId);
      if (ss) return ss;
    } catch (e) {
      console.warn('Could not open stored spreadsheet ID, creating new one.', e);
    }
  }
  
  // Create a brand new spreadsheet and store its ID
  ss = SpreadsheetApp.create('KCE_Green_Energy_Challenge_Database');
  props.setProperty(SPREADSHEET_ID_PROPERTY, ss.getId());
  return ss;
}

/**
 * Automatic Database Initialization.
 * Run this function once from the Apps Script editor to create all sheets,
 * set up headers with clean formatting, and seed the initial question bank.
 */
function setupDatabase() {
  const ss = getDatabaseSpreadsheet();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  
  try {
    // 1. PARTICIPANTS sheet
    initSheet(ss, 'PARTICIPANTS', [
      'Participant_ID', 'Timestamp', 'Full_Name', 'Organization', 'Category', 'Team_Name'
    ], [
      ['KCE-P-001', new Date(), 'Demo Visitor', 'KCE Exhibition', 'General Public', 'Solar Pioneers']
    ]);
    
    // 2. QUESTIONS sheet (100 Educational questions)
    const questionHeaders = [
      'Question_ID', 'Category', 'Difficulty', 'Question', 
      'Option_A', 'Option_B', 'Option_C', 'Option_D', 
      'Correct_Option', 'Explanation', 'Reference_Source', 'Verification_Status', 'Is_Active'
    ];
    
    const existingQSheet = ss.getSheetByName('QUESTIONS');
    if (!existingQSheet || existingQSheet.getLastRow() <= 1) {
      const qSheet = initSheet(ss, 'QUESTIONS', questionHeaders, []);
      const questionsData = getInitialQuestionBank();
      if (questionsData.length > 0) {
        qSheet.getRange(2, 1, questionsData.length, questionsData[0].length).setValues(questionsData);
      }
    }
    
    // 3. GAME_RESULTS sheet
    initSheet(ss, 'GAME_RESULTS', [
      'Game_ID', 'Participant_ID', 'Player_Name', 'Selected_Character', 'Team_Color', 
      'Game_Mode', 'Final_Score', 'Correct_Answers', 'Incorrect_Answers', 'Winner', 
      'Game_Duration_Sec', 'Game_Date', 'Accuracy_Percent'
    ], []);
    
    // 4. ANSWER_HISTORY sheet
    initSheet(ss, 'ANSWER_HISTORY', [
      'History_ID', 'Game_ID', 'Question_ID', 'Selected_Option', 'Is_Correct', 
      'Response_Time_Sec', 'Points_Earned', 'Timestamp'
    ], []);
    
    // 5. SETTINGS sheet
    initSheet(ss, 'SETTINGS', ['Setting_Key', 'Setting_Value', 'Description'], [
      ['ADMIN_PASSWORD', ADMIN_PASSWORD_DEFAULT, 'Admin dashboard access credential'],
      ['QUIZ_QUESTION_COUNT', '10', 'Number of questions per standard quiz session'],
      ['QUESTION_TIMER_SECONDS', '10', 'Time limit in seconds per question'],
      ['BASE_CORRECT_POINTS', '100', 'Base points awarded for correct answer'],
      ['SPEED_BONUS_MAX', '50', 'Maximum speed bonus points'],
      ['STREAK_BONUS_POINTS', '25', 'Extra points awarded for streaks >= 3'],
      ['APP_VERSION', '1.1.0', 'Platform deployment version']
    ]);
    
    // 6. CHARACTERS sheet
    initSheet(ss, 'CHARACTERS', [
      'Character_ID', 'Character_Name', 'Role_Title', 'Character_Description', 
      'Character_Color', 'Special_Ability', 'Active_Status'
    ], [
      ['solar-hero', 'Solar Hero', 'Photovoltaic Paladin', 'Equipped with photon-reflective armor and solar energy conversion shields.', '#FBB03B', 'Solar Beam Surge', 'ACTIVE'],
      ['green-guardian', 'Green Guardian', 'Ecosystem Defender', 'Protector of clean industrial zones with living bio-tech energy roots.', '#3C976C', 'Eco Shield Recovery', 'ACTIVE'],
      ['energy-explorer', 'Energy Explorer', 'Renewable Pioneer', 'Scouts advanced clean energy frontiers and innovative wind-solar hybrids.', '#47C1EA', 'Resource Scanning', 'ACTIVE'],
      ['eco-warrior', 'Eco Warrior', 'Zero-Carbon Champion', 'Battles greenhouse emissions with ultra-efficient clean kinetic energy.', '#57AD7B', 'Carbon Neutralize', 'ACTIVE'],
      ['solar-engineer', 'Solar Engineer', 'PLTS Systems Architect', 'Expert in designing industrial rooftop and floating solar arrays.', '#1E3A7A', 'Grid Sync Surge', 'ACTIVE'],
      ['wind-master', 'Wind Master', 'Kinetic Aerodynamicist', 'Harnesses atmospheric currents and modern smart-inverter frequencies.', '#35A2C9', 'Turbine Velocity', 'ACTIVE'],
      ['green-scientist', 'Green Scientist', 'Clean Tech Chemist', 'Researches next-gen battery storage systems and green hydrogen utility.', '#79BE8C', 'Molecular Battery Charge', 'ACTIVE'],
      ['power-champion', 'Power Champion', 'Grid Reliability Titan', 'Maintains 24/7 power stability for high-tech industrial plants.', '#3077B5', 'Mega-Watt Resilience', 'ACTIVE']
    ]);
    
    // Format sheet tabs with color
    colorSheetTabs(ss);
    
    return {
      status: 'SUCCESS',
      message: 'Database initialized successfully with 6 tables and 110 verified questions.',
      spreadsheetUrl: ss.getUrl()
    };
  } catch (err) {
    console.error('Error in setupDatabase: ', err);
    return { status: 'ERROR', message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to initialize or verify a worksheet with headers and styling.
 */
function initSheet(ss, sheetName, headers, defaultRows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1E3A7A')
               .setFontColor('#FFFFFF')
               .setFontWeight('bold')
               .setFontFamily('Google Sans, Arial, sans-serif')
               .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    if (defaultRows && defaultRows.length > 0) {
      sheet.getRange(2, 1, defaultRows.length, headers.length).setValues(defaultRows);
    }
  }
  return sheet;
}

/**
 * Visual styling for spreadsheet tabs.
 */
function colorSheetTabs(ss) {
  const tabColors = {
    'PARTICIPANTS': '#3077B5',
    'QUESTIONS': '#3C976C',
    'GAME_RESULTS': '#FBB03B',
    'ANSWER_HISTORY': '#57AD7B',
    'SETTINGS': '#1E3A7A',
    'CHARACTERS': '#79BE8C'
  };
  
  for (const [name, color] of Object.entries(tabColors)) {
    const s = ss.getSheetByName(name);
    if (s) s.setTabColor(color);
  }
}

/**
 * Registers a new participant before game entry.
 */
function registerParticipant(data) {
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('PARTICIPANTS') || initSheet(ss, 'PARTICIPANTS', [
    'Participant_ID', 'Timestamp', 'Full_Name', 'Organization', 'Category', 'Team_Name'
  ], []);
  
  const participantId = 'KCE-P-' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
  const fullName = (data.fullName || 'Anonymous Player').trim();
  const organization = (data.organization || 'Public Visitor').trim();
  const category = (data.category || 'General').trim();
  const teamName = (data.teamName || 'Green Energy Pioneers').trim();
  
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.appendRow([
      participantId,
      new Date(),
      fullName,
      organization,
      category,
      teamName
    ]);
  } finally {
    lock.releaseLock();
  }
  
  return {
    status: 'SUCCESS',
    participantId: participantId,
    fullName: fullName,
    organization: organization,
    category: category,
    teamName: teamName
  };
}

/**
 * Returns the list of active characters.
 */
function getCharacters() {
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('CHARACTERS');
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  const characters = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][6] === 'ACTIVE') {
      characters.push({
        id: rows[i][0],
        name: rows[i][1],
        title: rows[i][2],
        description: rows[i][3],
        color: rows[i][4],
        ability: rows[i][5]
      });
    }
  }
  return characters;
}

/**
 * Retrieves randomized questions for a game session.
 * SECURITY NOTICE: The correct answer (Correct_Option) is strictly omitted 
 * from the returned payload to prevent client-side inspection manipulation.
 */
function getQuestionsForGame(gameMode, count) {
  const countToFetch = count || 10;
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('QUESTIONS');
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  const allQuestions = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const isActive = row[12];
    if (isActive === true || isActive === 'TRUE' || isActive === 'ACTIVE') {
      allQuestions.push({
        id: row[0],
        category: row[1],
        difficulty: row[2],
        question: row[3],
        options: [row[4], row[5], row[6], row[7]],
        explanation: row[9], // Sent for post-answer review
        reference: row[10]
      });
    }
  }
  
  // Shuffle questions randomly
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(countToFetch, shuffled.length));
}

/**
 * Validates an answer strictly server-side.
 * Logs the answer event to ANSWER_HISTORY.
 */
function validateAnswer(questionId, selectedOptionIndex, responseTimeSec, gameId) {
  const ss = getDatabaseSpreadsheet();
  const qSheet = ss.getSheetByName('QUESTIONS');
  if (!qSheet) return { error: 'Questions sheet not found' };
  
  const rows = qSheet.getDataRange().getValues();
  let found = null;
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === questionId) {
      found = {
        correctOption: rows[i][8], // e.g., 'A', 'B', 'C', 'D' or 0, 1, 2, 3
        explanation: rows[i][9],
        category: rows[i][1]
      };
      break;
    }
  }
  
  if (!found) {
    return { isCorrect: false, correctIndex: 0, explanation: 'Question record not found' };
  }
  
  let correctIndex = 0;
  if (typeof found.correctOption === 'number') {
    correctIndex = found.correctOption;
  } else {
    const letter = String(found.correctOption).trim().toUpperCase();
    if (letter === 'A' || letter === '0') correctIndex = 0;
    else if (letter === 'B' || letter === '1') correctIndex = 1;
    else if (letter === 'C' || letter === '2') correctIndex = 2;
    else if (letter === 'D' || letter === '3') correctIndex = 3;
  }
  
  const isCorrect = (parseInt(selectedOptionIndex, 10) === correctIndex);
  
  // Compute points
  let points = 0;
  if (isCorrect) {
    const basePoints = 100;
    const timeLimit = 10;
    const remainingTime = Math.max(0, timeLimit - (responseTimeSec || 0));
    const speedBonus = Math.round((remainingTime / timeLimit) * 50);
    points = basePoints + speedBonus;
  }
  
  // Asynchronously or quickly log to ANSWER_HISTORY
  try {
    const hSheet = ss.getSheetByName('ANSWER_HISTORY');
    if (hSheet) {
      hSheet.appendRow([
        'HIST-' + Utilities.getUuid().slice(0, 8),
        gameId || 'ANON-GAME',
        questionId,
        selectedOptionIndex,
        isCorrect,
        responseTimeSec || 0,
        points,
        new Date()
      ]);
    }
  } catch (e) {
    console.warn('Logging answer history warning: ', e);
  }
  
  return {
    isCorrect: isCorrect,
    correctIndex: correctIndex,
    points: points,
    explanation: found.explanation
  };
}

/**
 * Submits the completed game result to GAME_RESULTS.
 */
function submitGameResult(result) {
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('GAME_RESULTS') || initSheet(ss, 'GAME_RESULTS', [
    'Game_ID', 'Participant_ID', 'Player_Name', 'Selected_Character', 'Team_Color', 
    'Game_Mode', 'Final_Score', 'Correct_Answers', 'Incorrect_Answers', 'Winner', 
    'Game_Duration_Sec', 'Game_Date', 'Accuracy_Percent'
  ], []);
  
  const gameId = 'KCE-G-' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd-HHmmss') + '-' + Math.floor(1000 + Math.random() * 9000);
  const totalAnswers = (result.correctAnswers || 0) + (result.incorrectAnswers || 0);
  const accuracy = totalAnswers > 0 ? Math.round((result.correctAnswers / totalAnswers) * 100) : 0;
  
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.appendRow([
      gameId,
      result.participantId || 'KCE-P-ANON',
      result.playerName || 'Player',
      result.character || 'solar-hero',
      result.teamColor || '#3077B5',
      result.gameMode || 'quiz',
      result.finalScore || 0,
      result.correctAnswers || 0,
      result.incorrectAnswers || 0,
      result.winner || result.playerName || 'Player',
      result.durationSec || 0,
      new Date(),
      accuracy + '%'
    ]);
  } finally {
    lock.releaseLock();
  }
  
  return {
    status: 'SUCCESS',
    gameId: gameId,
    accuracy: accuracy
  };
}

/**
 * Fetches the live leaderboard with filtering options.
 */
function getLeaderboard(timeFilter, modeFilter, limitCount) {
  const limit = limitCount || 10;
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('GAME_RESULTS');
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  const now = new Date();
  const todayStr = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd');
  
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const score = Number(row[6]) || 0;
    const mode = String(row[5]);
    const dateVal = row[11];
    const dateObj = dateVal instanceof Date ? dateVal : new Date(dateVal);
    
    // Apply Mode Filter
    if (modeFilter && modeFilter !== 'ALL' && mode.toLowerCase() !== modeFilter.toLowerCase()) {
      continue;
    }
    
    // Apply Time Filter
    if (timeFilter === 'DAILY') {
      const rowDateStr = Utilities.formatDate(dateObj, 'Asia/Jakarta', 'yyyy-MM-dd');
      if (rowDateStr !== todayStr) continue;
    } else if (timeFilter === 'WEEKLY') {
      const diffDays = (now.getTime() - dateObj.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7) continue;
    }
    
    list.push({
      gameId: row[0],
      participantId: row[1],
      playerName: row[2],
      character: row[3],
      teamColor: row[4],
      gameMode: row[5],
      score: score,
      correct: row[7],
      incorrect: row[8],
      winner: row[9],
      duration: row[10],
      date: Utilities.formatDate(dateObj, 'Asia/Jakarta', 'dd MMM yyyy HH:mm'),
      accuracy: row[12]
    });
  }
  
  // Sort descending by score, then duration ascending
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.duration - b.duration;
  });
  
  return list.slice(0, limit);
}

/**
 * Admin dashboard authentication.
 */
function adminLogin(password) {
  const ss = getDatabaseSpreadsheet();
  const sSheet = ss.getSheetByName('SETTINGS');
  let adminPass = ADMIN_PASSWORD_DEFAULT;
  
  if (sSheet) {
    const rows = sSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === 'ADMIN_PASSWORD') {
        adminPass = String(rows[i][1]).trim();
        break;
      }
    }
  }
  
  if (password === adminPass) {
    return {
      authenticated: true,
      token: Utilities.base64Encode(adminPass + ':' + new Date().getTime())
    };
  } else {
    return {
      authenticated: false,
      error: 'Invalid Administrator Credentials'
    };
  }
}

/**
 * Admin statistics aggregator.
 */
function getAdminStats() {
  const ss = getDatabaseSpreadsheet();
  const pSheet = ss.getSheetByName('PARTICIPANTS');
  const gSheet = ss.getSheetByName('GAME_RESULTS');
  const qSheet = ss.getSheetByName('QUESTIONS');
  
  const totalParticipants = pSheet ? Math.max(0, pSheet.getLastRow() - 1) : 0;
  const totalGames = gSheet ? Math.max(0, gSheet.getLastRow() - 1) : 0;
  const totalQuestions = qSheet ? Math.max(0, qSheet.getLastRow() - 1) : 0;
  
  let totalScore = 0;
  const modeCount = {};
  
  if (gSheet && gSheet.getLastRow() > 1) {
    const gRows = gSheet.getDataRange().getValues();
    for (let i = 1; i < gRows.length; i++) {
      totalScore += (Number(gRows[i][6]) || 0);
      const mode = gRows[i][5] || 'quiz';
      modeCount[mode] = (modeCount[mode] || 0) + 1;
    }
  }
  
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  
  return {
    totalParticipants: totalParticipants,
    totalGames: totalGames,
    totalQuestions: totalQuestions,
    avgScore: avgScore,
    modeDistribution: modeCount
  };
}

/**
 * Retrieves all questions for admin editing.
 */
function getAdminQuestions() {
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('QUESTIONS');
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  const questions = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    questions.push({
      id: row[0],
      category: row[1],
      difficulty: row[2],
      question: row[3],
      optionA: row[4],
      optionB: row[5],
      optionC: row[6],
      optionD: row[7],
      correctOption: row[8],
      explanation: row[9],
      reference: row[10],
      status: row[11],
      isActive: (row[12] === true || row[12] === 'TRUE' || row[12] === 'ACTIVE')
    });
  }
  return questions;
}

/**
 * Saves (adds or updates) a question from the admin dashboard.
 */
function adminSaveQuestion(qData) {
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('QUESTIONS');
  if (!sheet) return { error: 'Questions sheet not found' };
  
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const rows = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    if (qData.id) {
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === qData.id) {
          rowIndex = i + 1;
          break;
        }
      }
    }
    
    const questionId = qData.id || ('Q' + ('000' + (rows.length)).slice(-3));
    const rowValues = [
      questionId,
      qData.category || 'General',
      qData.difficulty || 'Medium',
      qData.question || '',
      qData.optionA || '',
      qData.optionB || '',
      qData.optionC || '',
      qData.optionD || '',
      qData.correctOption || 'A',
      qData.explanation || '',
      qData.reference || 'KCE Official',
      qData.status || 'VERIFIED',
      qData.isActive ? 'ACTIVE' : 'INACTIVE'
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    
    return { status: 'SUCCESS', id: questionId };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Toggles a question's active status.
 */
function adminToggleQuestionStatus(questionId, isActive) {
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName('QUESTIONS');
  if (!sheet) return { error: 'Sheet not found' };
  
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === questionId) {
      sheet.getRange(i + 1, 13).setValue(isActive ? 'ACTIVE' : 'INACTIVE');
      return { status: 'SUCCESS', id: questionId, isActive: isActive };
    }
  }
  return { error: 'Question not found' };
}

/**
 * Exports data as CSV for spreadsheet backup.
 */
function exportDataCSV(sheetName) {
  const ss = getDatabaseSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return '';
  
  const rows = sheet.getDataRange().getValues();
  return rows.map(row => 
    row.map(val => {
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  ).join('\r\n');
}

/**
 * Helper: Array shuffle (Fisher-Yates)
 */
function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * SEED QUESTION BANK: 110 Verified Educational Questions
 * Formatted as: [ID, Category, Difficulty, Question, A, B, C, D, Correct, Explanation, Ref, Status, Active]
 */
function getInitialQuestionBank() {
  return [
    // --- CATEGORY 1: KRAKATAU CHANDRA ENERGI (KCE) [Q001 - Q020] ---
    [
      'Q001', 'Krakatau Chandra Energi', 'Easy',
      'Siapakah PT Krakatau Chandra Energi (KCE) dalam peta industri energi nasional?',
      'Perusahaan penyedia solusi energi terintegrasi dan utilitas industri',
      'Perusahaan manufaktur komponen ponsel pintar',
      'Penyedia jasa logistik transportasi umum laut',
      'Lembaga riset astronomi antariksa',
      'A',
      'KCE adalah penyedia solusi energi listrik, utilitas, dan infrastruktur energi terintegrasi untuk kawasan industri Cilegon dan sekitarnya.',
      'Profil Perusahaan KCE', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q002', 'Krakatau Chandra Energi', 'Easy',
      'Di kawasan manakah pusat operasional utama Krakatau Chandra Energi berada?',
      'Kawasan Industri Cilegon, Banten',
      'Kawasan Industri Morowali',
      'Kawasan Industri Medan',
      'Kawasan Industri Jababeka Cikarang',
      'A',
      'Pusat instalasi dan operasional pembangkit KCE berpusat di Kawasan Industri Cilegon, Banten, melayani industri baja dan petrokimia.',
      'KCE Company Profile', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q003', 'Krakatau Chandra Energi', 'Medium',
      'KCE merupakan bagian dari kelompok usaha terkemuka yang terintegrasi dengan...',
      'Chandra Asri Group dan Barito Pacific',
      'Telkom Indonesia Group',
      'Garuda Indonesia Group',
      'Unilever Global Group',
      'A',
      'KCE merupakan entitas strategis di bawah ekosistem Chandra Asri Group & Barito Pacific dalam mendukung transisi energi hijau terintegrasi.',
      'KCE Corporate Governance', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q004', 'Krakatau Chandra Energi', 'Easy',
      'Apa nama proyek tenaga surya yang dipasang di atap gedung fasilitas industri oleh KCE?',
      'PLTS Atap (Rooftop Solar PV)',
      'PLT Nuklir Mini',
      'PLTA Bendungan',
      'PLTU Batubara Superkritis',
      'A',
      'PLTS Atap (Rooftop Solar) adalah instalasi fotovoltaik pada atap pabrik dan bangunan untuk memanen sinar matahari menjadi energi bersih.',
      'KCE Green Projects', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q005', 'Krakatau Chandra Energi', 'Medium',
      'Apa inovasi tenaga surya di atas permukaan perairan yang dikembangkan oleh KCE?',
      'PLTS Terapung (Floating Solar PV)',
      'Pembangkit Gelombang Magnetik Laut',
      'Reaktor Fusi Air Asin',
      'Pembangkit Uap Geotermal Samudera',
      'A',
      'KCE mengembangkan PLTS Terapung (Floating Solar) di waduk/kolam retensi untuk memaksimalkan efisiensi pendinginan dan menghemat lahan daratan.',
      'KCE Sustainability Report', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q006', 'Krakatau Chandra Energi', 'Medium',
      'Apa manfaat utama PLTS Terapung dibandingkan PLTS di daratan kering?',
      'Efek pendinginan air meningkatkan efisiensi panel & mengurangi evaporasi air',
      'Menghasilkan arus bolak-balik tanpa menggunakan inverter',
      'Menghilangkan kebutuhan akan kabel transmisi listrik',
      'Dapat menyerap sinar matahari saat malam hari',
      'A',
      'Suhu permukaan air yang sejuk menjaga suhu sel surya tetap optimal, meningkatkan efisiensi keluaran listrik hingga 5-10% serta menekan penguapan air.',
      'KCE Technical Brief', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q007', 'Krakatau Chandra Energi', 'Easy',
      'Apa komitmen KCE terhadap target penurunan emisi gas rumah kaca di Indonesia?',
      'Mendukung peta jalan Net Zero Emission (NZE) melalui transisi energi bersih',
      'Meningkatkan konsumsi bahan bakar fosil tanpa kendali',
      'Menutup seluruh fasilitas tanpa memproduksi energi',
      'Memindahkan seluruh emisi ke negara tetangga',
      'A',
      'KCE berkomitmen penuh mendukung target Indonesia mencapai Net Zero Emission melalui dekarbonisasi dan percepatan EBT.',
      'KCE ESG Policy', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q008', 'Krakatau Chandra Energi', 'Medium',
      'Selain listrik, utilitas apa saja yang dikelola KCE untuk mendukung industri di Cilegon?',
      'Pasokan air industri, uap (steam), dan sistem kelistrikan andal',
      'Penyediaan bahan bakar roket cair',
      'Jasa telekomunikasi satelit orbit rendah',
      'Pencetakan mata uang fisik regional',
      'A',
      'KCE mengelola pasokan energi listrik andal, steam, dan air industri untuk menopang rantai industri petrokimia dan baja strategis.',
      'KCE Business Lines', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q009', 'Krakatau Chandra Energi', 'Hard',
      'Karakteristik keandalan listrik (power reliability) yang dijaga KCE sangat krusial bagi pabrik kimia karena...',
      'Proses petrokimia dan peleburan baja memerlukan pasokan listrik stabil tanpa kedip',
      'Mesin industri otomatis berhenti jika listrik terlalu murah',
      'Agar lampu penerangan jalan umum selalu berwarna biru',
      'Karena bahan kimia memerlukan radiasi frekuensi tinggi konstan',
      'A',
      'Pabrik petrokimia dan baja beroperasi terus-menerus 24/7; kedip tegangan sekecil apapun dapat merusak reaktor dan menyebabkan gangguan proses berisiko tinggi.',
      'KCE Engineering Guide', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q010', 'Krakatau Chandra Energi', 'Easy',
      'Warna identitas utama yang mencerminkan keberlanjutan dan teknologi pada KCE adalah...',
      'Biru Energi (Keandalan/Teknologi) dan Hijau (Keberlanjutan)',
      'Merah Terang dan Hitam Pekat',
      'Cokelat Tanah dan Abu-abu Karat',
      'Ungu Neon dan Merah Muda',
      'A',
      'Biru melambangkan keandalan, profesionalisme, dan teknologi tinggi; Hijau melambangkan komitmen ekologis dan energi terbarukan.',
      'KCE Brand Guidelines', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q011', 'Krakatau Chandra Energi', 'Medium',
      'Bagaimanakah KCE membantu mitra industri mengurangi jejak karbon (carbon footprint)?',
      'Menyediakan pasokan listrik hijau dari PLTS dan sertifikat energi terbarukan (REC)',
      'Mengurangi jam kerja pabrik menjadi satu hari per minggu',
      'Menghilangkan penggunaan meteran listrik',
      'Mengganti kabel tembaga dengan kawat benang sutra',
      'A',
      'KCE menyediakan pasokan bauran energi hijau langsung dan memfasilitasi Renewable Energy Certificate (REC) terakreditasi.',
      'KCE Decarbonization Roadmap', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q012', 'Krakatau Chandra Energi', 'Medium',
      'Sertifikat yang membuktikan bahwa satuan listrik tertentu dihasilkan dari sumber energi terbarukan disebut...',
      'Renewable Energy Certificate (REC)',
      'Surat Izin Mengemudi Energi (SIM-E)',
      'Kartu Identitas Bebas Asap (KIBA)',
      'Ijazah Kelistrikan Internasional',
      'A',
      'REC adalah instrumen pasar internasional yang merepresentasikan kepemilikan atribut lingkungan atas produksi 1 MWh listrik energi terbarukan.',
      'EBTKE Kementerian ESDM', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q013', 'Krakatau Chandra Energi', 'Easy',
      'Apa singkatan dari PLTS yang gencar dibangun oleh KCE?',
      'Pembangkit Listrik Tenaga Surya',
      'Pembangkit Listrik Tenaga Suara',
      'Pusat Layanan Transformasi Sumberdaya',
      'Program Listrik Tenaga Sintetis',
      'A',
      'PLTS adalah Pembangkit Listrik Tenaga Surya yang mengonversi energi foton matahari langsung menjadi listrik.',
      'Kamus ESDM', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q014', 'Krakatau Chandra Energi', 'Medium',
      'Dalam operasional fasilitas PLTS KCE, komponen apa yang memantau performa energi secara real-time?',
      'SCADA dan Energy Management System (EMS)',
      'Barometer raksa manual',
      'Kompas magnetik analog',
      'Timbangan pegas mekanik',
      'A',
      'SCADA (Supervisory Control and Data Acquisition) dan EMS memonitor tegangan, arus, iradiasi, dan performa panel secara daring seketika.',
      'KCE Smart Grid System', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q015', 'Krakatau Chandra Energi', 'Hard',
      'Bagaimana PLTS Atap KCE terintegrasi dengan jaringan listrik pabrik yang sudah ada?',
      'Melalui sistem sinkronisasi On-Grid dengan proteksi anti-islanding',
      'Menggunakan saklar manual manual dua kutub',
      'Dengan memutus seluruh kabel utama dari gardu induk',
      'Dihubungkan langsung ke pipa air pendingin',
      'A',
      'PLTS On-Grid disinkronkan frekuensi dan tegangannya dengan grid pabrik dan dilengkapi proteksi anti-islanding demi keselamatan teknisi.',
      'KCE Electrical Safety Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q016', 'Krakatau Chandra Energi', 'Easy',
      'Mengapa kawasan industri Cilegon sangat strategis untuk implementasi energi hijau KCE?',
      'Cilegon adalah sentra industri berat nasional dengan kebutuhan energi masif',
      'Karena di Cilegon tidak pernah terjadi hujan sama sekali',
      'Karena Cilegon berada di dataran tinggi pegunungan es',
      'Karena tidak ada kawasan industri lain di pulau Jawa',
      'A',
      'Cilegon merupakan pusat industri petrokimia dan manufaktur berat nasional; dekarbonisasi di wilayah ini berdampak masif pada emisi nasional.',
      'KCE Industrial Insight', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q017', 'Krakatau Chandra Energi', 'Medium',
      'Apa prinsip Environmental, Social, and Governance (ESG) yang diterapkan KCE?',
      'Mengintegrasikan kelestarian alam, tanggung jawab sosial, dan tata kelola transparan',
      'Mengejar profit ekonomi semata tanpa memedulikan lingkungan',
      'Menolak audit dan evaluasi kinerja tahunan',
      'Menyerahkan pengelolaan limbah tanpa prosedur resmi',
      'A',
      'ESG adalah pilar utama KCE dalam menjamin operasional berkelanjutan bagi bumi, karyawan, masyarakat, dan seluruh pemangku kepentingan.',
      'KCE Sustainability Policy', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q018', 'Krakatau Chandra Energi', 'Hard',
      'Teknologi penyimpanan apa yang dipersiapkan KCE untuk menjaga kestabilan daya PLTS saat cuaca berawan?',
      'Battery Energy Storage System (BESS)',
      'Tangki bensin cadangan darurat',
      'Generator uap batubara tambahan',
      'Pegas mekanik raksasa berputar',
      'A',
      'BESS berbasis litium menyimpan kelebihan energi surya saat terik dan menyalurkannya saat beban puncak atau radiasi matahari menurun.',
      'KCE Smart Energy Future', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q019', 'Krakatau Chandra Energi', 'Easy',
      'Siapakah yang dapat menikmati edukasi dan inspirasi energi hijau dari Krakatau Chandra Energi?',
      'Semua lapisan: pelajar, mahasiswa, profesional, dan masyarakat umum',
      'Hanya teknisi yang memiliki lisensi internasional',
      'Hanya pejabat kementerian terkait',
      'Hanya pemilik saham perusahaan',
      'A',
      'Edukasi energi bersih adalah hak semua generasi untuk membangun kesadaran bersama menuju bumi yang lebih lestari.',
      'KCE Community Engagement', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q020', 'Krakatau Chandra Energi', 'Medium',
      'Apa visi jangka panjang Krakatau Chandra Energi di era transisi energi?',
      'Menjadi pelopor penyedia energi hijau dan utilitas industri berkelanjutan terdepan di Indonesia',
      'Menghentikan seluruh aktivitas pembangkitan daya listrik',
      'Fokus memproduksi kendaraan bermotor konvensional',
      'Menutup seluruh akses informasi publik',
      'A',
      'Visi KCE adalah memimpin transisi industri bersih Indonesia melalui solusi energi andal, ramah lingkungan, dan berkelanjutan.',
      'KCE Corporate Vision', 'VERIFIED', 'ACTIVE'
    ],

    // --- CATEGORY 2: SOLAR POWER PLANTS (PLTS) & SOLAR TECH [Q021 - Q045] ---
    [
      'Q021', 'Solar Power Plants', 'Easy',
      'Fenomena fisika apakah yang memungkinkan sel surya mengubah cahaya menjadi listrik?',
      'Efek Fotovoltaik (Photovoltaic Effect)',
      'Efek Rumah Kaca Termal',
      'Efek Doppler Akustik',
      'Efek Bernoulli Fluida',
      'A',
      'Efek fotovoltaik ditemukan oleh Edmond Becquerel tahun 1839, di mana foton cahaya mengeksitasi elektron pada material semikonduktor.',
      'Physics of Solar Cells', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q022', 'Solar Power Plants', 'Easy',
      'Arus listrik jenis apakah yang pertama kali dihasilkan langsung oleh modul panel surya?',
      'Direct Current (DC) / Arus Searah',
      'Alternating Current (AC) / Arus Bolak-Balik',
      'Arus Tiga Fasa Frekuensi Tinggi',
      'Arus Statis Gesekan',
      'A',
      'Sel fotovoltaik menghasilkan listrik DC (Direct Current). Inverter diperlukan untuk mengubahnya menjadi AC untuk peralatan umum.',
      'Solar Engineering Basics', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q023', 'Solar Power Plants', 'Medium',
      'Perangkat apa yang wajib ada pada PLTS untuk mengubah arus searah (DC) menjadi arus bolak-balik (AC)?',
      'Inverter Solar',
      'Transformator Penurun Tegangan Saja',
      'Kondensor Uap Bertekanan',
      'Karburator Elektronik',
      'A',
      'Inverter adalah otak dari sistem PLTS yang mengubah DC dari panel surya menjadi AC yang sinkron dengan frekuensi grid (50 Hz).',
      'Solar Components Handbook', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q024', 'Solar Power Plants', 'Medium',
      'Material semikonduktor paling umum yang digunakan untuk membuat sel surya komersial saat ini adalah...',
      'Silikon (Silicon)',
      'Aluminium Murni',
      'Tembaga Oksida',
      'Baja Karbon Tinggi',
      'A',
      'Silikon memiliki pita energi (band gap) ideal sekitar 1.1 eV yang sangat efisien untuk menyerap spektrum cahaya tampak matahari.',
      'Photovoltaic Materials Science', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q025', 'Solar Power Plants', 'Medium',
      'Jenis panel surya silikon yang memiliki efisiensi tertinggi dan warna hitam pekat homogen adalah...',
      'Monokristalin (Monocrystalline)',
      'Polikristalin (Polycrystalline)',
      'Thin Film Amorf',
      'Panel Organik Pewarna Buah',
      'A',
      'Panel monokristalin dibuat dari satu kristal silikon murni silindris dengan struktur atom seragam, memberikan efisiensi di atas 21-23%.',
      'Solar PV Technology Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q026', 'Solar Power Plants', 'Easy',
      'Satuan daya puncak maksimum yang dapat dihasilkan oleh sebuah modul surya pada kondisi uji standar (STC) adalah...',
      'Watt-peak (Wp)',
      'Lumen per Meter',
      'Joule per Detik Kuadrat',
      'Volt-Ampere Reaktif (VAR)',
      'A',
      'Wp (Watt-peak) menunjukkan daya keluaran maksimal panel saat diuji pada radiasi 1000 W/m² dan suhu sel 25°C.',
      'IEC 61215 Standard', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q027', 'Solar Power Plants', 'Medium',
      'Kondisi Standard Test Conditions (STC) dalam penentuan kapasitas modul surya mengacu pada radiasi sebesar...',
      '1000 W/m² pada suhu sel 25°C',
      '500 W/m² pada suhu sel 0°C',
      '2000 W/m² pada suhu sel 100°C',
      '100 W/m² pada suhu kamar 35°C',
      'A',
      'STC internasional ditetapkan pada radiasi 1000 W/m², temperatur sel 25°C, dan spektrum massa udara AM 1.5.',
      'Standard Test Conditions PV', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q028', 'Solar Power Plants', 'Hard',
      'Apa yang terjadi jika sebagian sel surya pada satu rangkaian string tertutup bayangan (shading)?',
      'Keluaran daya drop drastis dan sel tertutup bisa mengalami fenomena hot-spot',
      'Daya listrik panel surya otomatis meningkat dua kali lipat',
      'Arus listrik berubah langsung menjadi gelombang radio FM',
      'Panel surya akan mengeluarkan aroma wangi kayu manis',
      'A',
      'Sel yang terbayang bertindak sebagai resistor beban dan membuang daya sel lain dalam bentuk panas (hot-spot), dicegah dengan bypass diode.',
      'IEEE Photovoltaic Specialists', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q029', 'Solar Power Plants', 'Medium',
      'Di negara tropis seperti Indonesia di dekat khatulistiwa, panel surya biasanya dipasang dengan kemiringan...',
      'Kemiringan kecil (sekitar 5° - 15°) menghadap ke Utara atau Selatan untuk pembersihan air hujan',
      'Tegak lurus 90° menghadap ke Barat',
      'Kemiringan 80° menghadap ke Timur saja',
      'Tengkurap menghadap ke bawah permukaan atap',
      'A',
      'Kemiringan 5°-15° cukup untuk memaksimalkan penyerapan matahari sepanjang tahun sekaligus memanfaatkan air hujan membersihkan debu (self-cleaning).',
      'Panduan Teknis PLTS ESDM', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q030', 'Solar Power Plants', 'Hard',
      'Apa fungsi fitur Maximum Power Point Tracking (MPPT) pada inverter surya canggih?',
      'Melacak titik tegangan dan arus optimum secara terus-menerus agar daya yang dipanen selalu maksimal',
      'Mengukur arah angin untuk memutar tiang panel',
      'Menyaring kotoran fisik pada kabel listrik',
      'Mendeteksi keberadaan burung di atas atap',
      'A',
      'Algoritma MPPT secara dinamis menyesuaikan impedansi sirkuit agar sistem selalu bekerja pada titik daya maksimum (Pmax) kurva I-V.',
      'Inverter Topology & Control', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q031', 'Solar Power Plants', 'Easy',
      'Mengapa energi surya disebut sebagai sumber energi yang tak terbatas (inexhaustible)?',
      'Matahari memancarkan energi fusi nuklir alami yang diperkirakan bertahan miliaran tahun',
      'Karena panel surya bisa memproduksi cahaya sendiri di tempat gelap',
      'Karena manusia bisa mengisi ulang energi matahari dengan baterai',
      'Karena sinar matahari dapat dibeli di pasar swalayan',
      'A',
      'Radiasi matahari ditenagai oleh reaksi fusi hidrogen menjadi helium yang telah berlangsung 4,6 miliar tahun dan diproyeksikan bertahan 5 miliar tahun lagi.',
      'NASA Solar Science', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q032', 'Solar Power Plants', 'Medium',
      'Sistem PLTS yang terhubung langsung dengan jaringan listrik PLN tanpa baterai disebut...',
      'PLTS On-Grid (Grid-Tied)',
      'PLTS Off-Grid Standalone',
      'Sistem Termal Tertutup',
      'Sistem Mekanikal Murni',
      'A',
      'PLTS On-Grid bekerja beriringan dengan jaringan utilitas, menyalurkan listrik saat siang dan mengambil dari grid saat malam.',
      'EBTKE PLN Regulation', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q033', 'Solar Power Plants', 'Medium',
      'Meteran khusus dua arah yang mencatat ekspor dan impor listrik pada pelanggan PLTS disebut...',
      'Net Metering (Meteran Ekspor-Impor)',
      'Speedometer Listrik Analog',
      'Termometer Bimetal Industri',
      'Water Meter Turbin',
      'A',
      'Meteran Exim (Ekspor-Impor) mencatat selisih energi yang dipakai dari grid dan energi bersih yang dikirimkan ke grid.',
      'Permen ESDM PLTS Atap', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q034', 'Solar Power Plants', 'Hard',
      'Proteksi keselamatan wajib pada inverter On-Grid yang mematikan inverter seketika jika listrik PLN padam disebut...',
      'Anti-Islanding Protection',
      'Over-Clocking Shield',
      'Turbine Governor Lock',
      'Firewall Anti-Spam',
      'A',
      'Proteksi anti-islanding mencegah inverter menyuplai daya ke jaringan luar saat gardu PLN padam, melindungi teknisi PLN dari bahaya tersengat listrik.',
      'IEEE 1547 Interconnection Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q035', 'Solar Power Plants', 'Easy',
      'Berapa rata-rata masa pakai (lifespan) garansi performa modul surya berkualitas tinggi?',
      '25 hingga 30 tahun',
      '1 hingga 2 tahun saja',
      '100 hari kerja',
      'Tidak lebih dari 6 bulan',
      'A',
      'Modul surya tier-1 modern memiliki masa garansi keluaran daya linier hingga 25-30 tahun dengan degradasi hanya sekitar 0,5% per tahun.',
      'BloombergNEF Tier-1 Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q036', 'Solar Power Plants', 'Medium',
      'Faktor apa yang dapat menurunkan efisiensi panel surya jika tidak dirawat secara berkala?',
      'Penumpukan debu, kotoran burung (soiling), dan bayangan pohon/gedung',
      'Pemaparan sinar matahari yang terlalu terang',
      'Pembersihan panel dengan air bersih bersuhu normal',
      'Pemasangan kabel tanah bertanah standar',
      'A',
      'Soiling (lapisan debu dan partikel polusi) dapat menghalangi radiasi cahaya hingga 10-25% jika panel tidak dibersihkan secara rutin.',
      'O&M Solar Best Practices', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q037', 'Solar Power Plants', 'Hard',
      'Koefisien temperatur (temperature coefficient) pada panel surya silikon menunjukkan bahwa...',
      'Efisiensi sel surya justru sedikit menurun saat suhu panel menjadi terlalu panas di atas 25°C',
      'Panel surya hanya bekerja optimal pada suhu 100°C mendidih',
      'Suhu dingin selalu membakar sirkuit listrik fotovoltaik',
      'Semakin panas suhu permukaan, arus searah semakin membeku',
      'A',
      'Sel silikon mengalami penurunan voltase sebesar ~0,35% per kenaikan 1°C di atas 25°C. Inilah mengapa PLTS Terapung yang lebih sejuk lebih efisien!',
      'Solar Cell Thermodynamics', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q038', 'Solar Power Plants', 'Easy',
      'Komponen apa yang berfungsi sebagai rangka penyangga kokoh bagi modul surya di atap atau tanah?',
      'Mounting Structure (Rangka Braket Aluminium / Galvanis)',
      'Pita perekat kertas biasa',
      'Karet gelang elastis',
      'Batu bata yang disusun lepas',
      'A',
      'Mounting structure terbuat dari aluminium anodized atau baja hot-dip galvanis yang tahan karat dan sanggup menahan beban terpaan angin kencang.',
      'Structural Engineering for Solar', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q039', 'Solar Power Plants', 'Medium',
      'Konektor standar industri yang tahan air dan cuaca untuk menyambung modul surya adalah...',
      'Konektor MC4',
      'Colokan Audio Jack 3.5mm',
      'Kabel USB Tipe-C',
      'Konektor Port HDMI',
      'A',
      'Konektor MC4 (Multi-Contact 4 mm²) adalah standar internasional berperingkat IP67/IP68 untuk sambungan listrik tegangan tinggi DC panel surya.',
      'NEC Electrical Code Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q040', 'Solar Power Plants', 'Hard',
      'Teknologi panel surya "Bifacial" memiliki keunggulan khusus berupa...',
      'Mampu memanen cahaya dari kedua sisi (permukaan depan dan belakang dari pantulan albedo)',
      'Bisa menghasilkan bensin cair saat disinari matahari',
      'Dapat dilipat menjadi ukuran kantong baju kemeja',
      'Memiliki dua kabel colokan ke sumber PLN berbeda',
      'A',
      'Panel bifacial menyerap sinar langsung di sisi atas dan pantulan cahaya dari tanah/air (albedo) di sisi bawah, menambah daya hingga 10-25%.',
      'NREL Bifacial PV Studies', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q041', 'Solar Power Plants', 'Easy',
      'Apakah panel surya tetap menghasilkan listrik saat kondisi langit mendung?',
      'Ya, tetap menghasilkan listrik dari radiasi difus (diffuse radiation), meski kapasitasnya berkurang',
      'Sama sekali nol persen tidak menghasilkan arus apa pun',
      'Panel surya akan meledak jika terkena awan mendung',
      'Panel surya akan menyerap listrik dari rumah ke langit',
      'A',
      'Meski radiasi langsung terhalang awan, radiasi difus yang tersebar di atmosfer tetap menembus dan diserap panel menghasilkan sekitar 15-30% daya.',
      'Solar Radiation Fundamentals', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q042', 'Solar Power Plants', 'Medium',
      'Alat ukur radiasi sinar matahari yang dipasang di stasiun cuaca PLTS disebut...',
      'Piranometer (Pyranometer)',
      'Higrometer Rambut Basah',
      'Anemometer Cangkir',
      'Seismograf Getaran Bumi',
      'A',
      'Piranometer mengukur fluks radiasi matahari total (dalam W/m²) yang jatuh pada permukaan datar untuk menghitung Performance Ratio (PR) PLTS.',
      'WMO Meteorological Instruments', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q043', 'Solar Power Plants', 'Hard',
      'Rasio Kinerja atau Performance Ratio (PR) dalam evaluasi kualitas PLTS menggambarkan...',
      'Perbandingan antara energi listrik riil yang dihasilkan terhadap energi teoritis sesuai radiasi matahari yang diterima',
      'Jumlah keuntungan laba kotor dibagi harga tiket masuk',
      'Berat total modul dibagi jumlah tiang baja',
      'Jumlah hari libur teknisi dalam satu tahun kalender',
      'A',
      'Performance Ratio (PR) umumnya bernilai 78% - 85%, memperhitungkan rugi-rugi termal, kabel, inverter, dan kotoran.',
      'IEC 61724 PV System Performance', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q044', 'Solar Power Plants', 'Easy',
      'Apakah modul surya mengeluarkan emisi asap beracun atau polusi suara saat beroperasi?',
      'Tidak, PLTS beroperasi tanpa emisi gas buang, tanpa suara bising, dan tanpa bagian bergerak',
      'Ya, PLTS mengeluarkan asap jelaga hitam pekat',
      'Ya, suara modul surya terdengar seperti mesin jet pesawat',
      'Ya, mengeluarkan getaran gempa bumi berskala kecil',
      'A',
      'PLTS bersifat pasif dan hening (zero emission during operation), menjadikannya sangat ideal untuk kawasan industri modern dan atap perkotaan.',
      'IPCC Clean Technology Report', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q045', 'Solar Power Plants', 'Medium',
      'Apa yang dilakukan pada panel surya setelah masa operasional 30 tahun berakhir?',
      'Didaur ulang untuk mengambil kembali kaca, aluminium rangka, dan silikon murni',
      'Dibuang begitu saja ke dasar palung laut dalam',
      'Dibakar di tungku terbuka bersama sampah rumah tangga',
      'Ditinggalkan selamanya tanpa pengawasan',
      'A',
      'Lebih dari 90-95% material modul surya (kaca, aluminium, silikon, tembaga) bernilai tinggi dan dapat didaur ulang dalam ekonomi sirkular modern.',
      'PV Cycle Circular Economy', 'VERIFIED', 'ACTIVE'
    ],

    // --- CATEGORY 3: RENEWABLE ENERGY & TRANSITION [Q046 - Q070] ---
    [
      'Q046', 'Renewable Energy', 'Easy',
      'Manakah di bawah ini yang merupakan contoh sumber energi terbarukan?',
      'Sinar matahari, angin, air, dan panas bumi',
      'Batubara kalori rendah dan solar subsidi',
      'Minyak bumi mentah dan gas alam serpih',
      'Uranium tak terolah dan aspal alam',
      'A',
      'Energi terbarukan berasal dari proses alam berkelanjutan yang terus terisi ulang secara alami dan tidak akan habis.',
      'IEA Renewable Energy Overview', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q047', 'Renewable Energy', 'Easy',
      'Apa kelemahan utama dari bahan bakar fosil seperti batubara dan minyak bumi?',
      'Menghasilkan emisi karbon dioksida pemicu pemanasan global dan jumlah cadangannya terbatas',
      'Bahan bakar fosil terlalu dingin saat dibakar',
      'Sulit ditemukan di dalam kerak bumi mana pun',
      'Bahan bakar fosil menghasilkan oksigen terlalu berlimpah',
      'A',
      'Pembakaran fosil melepaskan miliaran ton CO₂ ke atmosfer yang memerangkap panas dan memicu krisis iklim global.',
      'UN Climate Action / UNFCCC', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q048', 'Renewable Energy', 'Medium',
      'Indonesia memiliki potensi energi terbarukan yang sangat kaya karena terletak di daerah...',
      'Khatulistiwa tropis dengan sinar matahari melimpah sepanjang tahun serta cincin api (Ring of Fire) geotermal',
      'Kutub utara yang dipenuhi gletser es abadi',
      'Gurun salju tundra tanpa vegetasi',
      'Lembah bebatuan tanpa atmosfer bumi',
      'A',
      'Indonesia menerima iradiasi surya konsisten 4,8 kWh/m²/hari dan memiliki ~40% potensi panas bumi (geothermal) dunia.',
      'Grand Strategi Energi Nasional ESDM', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q049', 'Renewable Energy', 'Medium',
      'Tantangan utama energi surya dan angin yang bergantung pada cuaca sering disebut sebagai sifat...',
      'Intermittency (Intermitensi)',
      'Superkonduktivitas',
      'Radioaktivitas',
      'Inelastisitas Sempurna',
      'A',
      'Intermitensi berarti daya keluaran berfluktuasi sesuai intensitas sinar matahari atau kecepatan angin, yang diatasi dengan baterai dan smart grid.',
      'Grid Modernization Studies', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q050', 'Renewable Energy', 'Easy',
      'Pembangkit listrik yang memanfaatkan tiupan angin untuk memutar bilah sudu generator disebut...',
      'PLTB (Pembangkit Listrik Tenaga Bayu/Angin)',
      'PLTD (Pembangkit Listrik Tenaga Diesel)',
      'PLTU (Pembangkit Listrik Tenaga Uap)',
      'PLTG (Pembangkit Listrik Tenaga Gas)',
      'A',
      'PLTB memanfaatkan energi kinetik angin untuk memutar rotor aerodinamis yang menggerakkan generator listrik.',
      'Wind Energy Technology', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q051', 'Renewable Energy', 'Medium',
      'Apa yang dimaksud dengan "Green Hydrogen" (Hidrogen Hijau)?',
      'Hidrogen yang diproduksi melalui elektrolisis air menggunakan listrik dari sumber energi terbarukan',
      'Hidrogen yang dicampur pewarna makanan hijau',
      'Hidrogen yang diekstraksi langsung dari batubara kotor',
      'Gas elpiji yang disimpan di tabung berwarna hijau',
      'A',
      'Hidrogen hijau dibuat dengan memecah molekul air (H₂O) murni menjadi H₂ dan O₂ menggunakan listrik 100% EBT tanpa emisi karbon.',
      'Hydrogen Council Global Report', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q052', 'Renewable Energy', 'Hard',
      'Dalam sistem tenaga listrik modern, "Smart Grid" memiliki keunggulan berupa...',
      'Jaringan transmisi cerdas berbasis digital dua arah yang mengintegrasikan berbagai sumber EBT dan beban secara otomatis',
      'Kabel listrik yang terbuat dari bahan kayu jati',
      'Jaringan tiang listrik yang bisa bergerak sendiri ke jalan raya',
      'Sistem saklar manual tanpa koneksi internet sama sekali',
      'A',
      'Smart Grid memanfaatkan IoT, sensor digital, dan kecerdasan analitik untuk menyeimbangkan pasokan variabel EBT dan kestabilan frekuensi jaringan.',
      'IEEE Smart Grid Initiative', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q053', 'Renewable Energy', 'Easy',
      'Target bauran energi nasional Indonesia menuju transisi hijau diatur oleh pemerintah melalui...',
      'Kebijakan Energi Nasional (KEN) dan Rencana Umum Energi Nasional (RUEN)',
      'Undang-Undang Perfilman dan Pariwisata',
      'Peraturan Tata Tertib Sekolah Dasar',
      'Pedoman Pendaftaran Merek Dagang Kuliner',
      'A',
      'Pemerintah melalui KEN dan RUEN menargetkan peningkatan signifikan bauran EBT menuju Net Zero Emission 2060 atau lebih cepat.',
      'Dewan Energi Nasional (DEN)', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q054', 'Renewable Energy', 'Medium',
      'Istilah "Grid Parity" dalam industri energi terbarukan merujuk pada kondisi di mana...',
      'Biaya produksi listrik dari EBT sudah sama atau lebih murah daripada listrik dari bahan bakar fosil konvensional',
      'Dua tiang listrik roboh pada waktu bersamaan',
      'Semua lampu kota dimatikan secara serentak',
      'Kapasitas trafo listrik bernilai negatif',
      'A',
      'Grid Parity tercapai ketika Levelized Cost of Electricity (LCOE) dari energi surya/angin bersaing langsung tanpa subsidi dengan tarif listrik grid.',
      'IRENA Renewable Power Generation Costs', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q055', 'Renewable Energy', 'Medium',
      'Teknologi baterai yang paling dominan digunakan dalam instalasi skala utilitas dan kendaraan listrik saat ini adalah...',
      'Baterai Litium-Ion (Lithium-Ion / LiFePO4)',
      'Baterai Seng Karbon Jadul 1.5V',
      'Aki Timbal Asam Terbuka Kuno',
      'Baterai Kentang Percobaan Sekolah Dasar',
      'A',
      'Litium-ion (termasuk LFP - Lithium Iron Phosphate) menawarkan kerapatan energi tinggi, efisiensi siklus >90%, dan umur pakai ribuan kali siklus.',
      'Battery Energy Storage Market Review', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q056', 'Renewable Energy', 'Hard',
      'Fungsi utama "Peak Shaving" pada sistem baterai industri terintegrasi adalah...',
      'Memasok daya dari baterai saat jam beban puncak pabrik untuk memotong biaya beban puncak listrik industri',
      'Mencukur rumput liar di sekitar gardu listrik induk',
      'Menaikkan voltase listrik setinggi mungkin saat malam hari',
      'Mengurangi jam tidur operator pembangkit',
      'A',
      'Peak shaving menghemat biaya industri dengan mengalirkan daya cadangan saat beban pabrik melonjak tinggi, meratakan kurva beban (load leveling).',
      'Industrial Energy Management', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q057', 'Renewable Energy', 'Easy',
      'Pembangkit listrik yang memanfaatkan uap panas bertekanan tinggi dari perut bumi disebut...',
      'PLTP (Pembangkit Listrik Tenaga Panas Bumi / Geothermal)',
      'PLTU (Pembangkit Listrik Tenaga Udara)',
      'PLTMH (Pembangkit Listrik Tenaga Mesin Hidung)',
      'PLTN (Pembangkit Listrik Tenaga Nyamuk)',
      'A',
      'PLTP memanfaatkan entalpi uap alami dari fluida hidrotermal di kedalaman bumi untuk menggerakkan turbin uap secara ramah lingkungan.',
      'Geothermal Energy Handbook', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q058', 'Renewable Energy', 'Medium',
      'Pembangkit Listrik Tenaga Mikrohidro (PLTMH) biasanya cocok dibangun di kawasan pedesaan berbukit karena...',
      'Memanfaatkan aliran sungai kecil berarus deras atau perbedaan elevasi air (head) yang ramah lingkungan',
      'Membutuhkan pembangunan waduk raksasa yang menenggelamkan ribuan hektar hutan',
      'Memerlukan pembakaran kayu bakar ribuan ton per hari',
      'Membutuhkan turbin bertenaga roket cair',
      'A',
      'PLTMH ramah lingkungan (run-of-river) memanfaatkan potensi debit dan tinggi jatuh air alami tanpa merusak ekosistem sungai besar.',
      'Small Hydro Power Technology', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q059', 'Renewable Energy', 'Medium',
      'Energi biomassa modern memanfaatkan sumber daya alam berupa...',
      'Limbah pertanian, cangkang kelapa sawit, serpihan kayu, dan residu organik terkelola',
      'Kantong plastik bekas sekali pakai',
      'Limbah logam berat beracun',
      'Batuan granit padat dari dasar tambang',
      'A',
      'Biomassa memanfaatkan siklus karbon netral jangka pendek dari biomaterial tanaman organik terkelola.',
      'Bioenergy Sustainability Criteria', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q060', 'Renewable Energy', 'Hard',
      'Apa yang dimaksud dengan LCOE (Levelized Cost of Electricity)?',
      'Biaya rata-rata bersih untuk memproduksi satu satuan energi listrik (per kWh/MWh) sepanjang umur operasional pembangkit',
      'Harga jual beli saham perusahaan listrik di bursa efek',
      'Pajak bumi dan bangunan yang dibayar oleh gardu PLN',
      'Gaji bulanan seluruh teknisi dan manajer pabrik',
      'A',
      'LCOE membagi total biaya investasi awal, pemeliharaan, bahan bakar, dan pembongkaran dengan total energi listrik yang diproduksi selama masa pakai.',
      'NREL Energy Analysis Tools', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q061', 'Renewable Energy', 'Easy',
      'Mengapa transisi energi bersih sangat penting bagi generasi muda masa depan?',
      'Menjaga kelestarian biosfer bumi, mencegah bencana iklim, dan membuka lapangan kerja hijau (green jobs)',
      'Supaya manusia tidak perlu belajar ilmu pengetahuan lagi',
      'Agar semua orang berhenti menggunakan telepon pintar',
      'Supaya suhu udara bumi menjadi sedingin es kutub di mana saja',
      'A',
      'Green jobs di sektor energi surya, baterai, dan efisiensi energi merupakan salah satu sektor pencipta lapangan kerja dengan pertumbuhan tercepat di dunia.',
      'ILO Green Jobs Report', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q062', 'Renewable Energy', 'Medium',
      'Apa keuntungan utama penggabungan sistem hibrida (Solar-Wind Hybrid System)?',
      'Matahari bersinar kuat di siang hari dan angin kerap bertiup kencang di sore/malam hari, saling melengkapi profil produksi daya',
      'Menghasilkan kilat petir buatan di dalam ruangan',
      'Biaya perawatan menjadi nol rupiah selamanya',
      'Menghilangkan kebutuhan akan kabel grounding pentanahan',
      'A',
      'Komplementaritas profil cuaca surya dan angin meminimalkan kebutuhan kapasitas baterai yang terlalu besar pada sistem terisolasi.',
      'Hybrid Renewable Power Systems', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q063', 'Renewable Energy', 'Hard',
      'Dalam konteks integrasi EBT, istilah "Inertia" (Inersia Sistem Tenaga) mengacu pada...',
      'Energi kinetik rotasi yang tersimpan pada rotor generator turbin berputar untuk menahan perubahan frekuensi mendadak',
      'Kondisi malas bekerja bagi operator pembangkit saat shift malam',
      'Kekuatan magnet statis pada transformator tegangan rendah',
      'Tahanan isolasi pada kabel bawah laut',
      'A',
      'Pembangkit konvensional memiliki inersia mekanis besar; pada PLTS berbasis inverter, inersia sintetik (synthetic inertia) dihadirkan lewat smart inverter.',
      'Power System Stability and Control', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q064', 'Renewable Energy', 'Easy',
      'Kendaraan listrik (Electric Vehicle / EV) berkontribusi mengurangi emisi polusi udara perkotaan karena...',
      'Tidak memiliki knalpot dan tidak melepaskan gas buang beracun seperti CO, NOx, dan partikulat PM2.5 di jalan raya',
      'Bisa terbang melintasi gedung pencakar langit tanpa menyentuh aspal',
      'Kendaraan listrik tidak membutuhkan jalan beraspal',
      'Menghasilkan aroma parfum mawar dari roda ban',
      'A',
      'EV mengeliminasi emisi pipa gas buang langsung, dan jika dicas dengan listrik bersih seperti PLTS KCE, jejak karbonnya mendekati nol.',
      'Zero Emission Mobility Review', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q065', 'Renewable Energy', 'Medium',
      'Apa peran Stasiun Pengisian Kendaraan Listrik Umum (SPKLU) bertenaga surya dalam ekosistem hijau KCE?',
      'Menyediakan pengisian daya cepat (fast charging) ramah lingkungan langsung dari energi surya',
      'Sebagai tempat parkir mobil tanpa pengisian daya',
      'Sebagai tempat penjualan bahan bakar bensin beroktan rendah',
      'Sebagai tempat mencuci mobil otomatis saja',
      'A',
      'SPKLU berbasis solar carport KCE mengintegrasikan kanopi panel surya dengan charger EV ultra-cepat untuk mobilitas nol emisi.',
      'KCE EV Infrastructure Plan', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q066', 'Renewable Energy', 'Medium',
      'Teknologi "Pumped-Storage Hydropower" berfungsi sebagai...',
      'Baterai air alami raksasa yang memompa air ke waduk atas saat surplus listrik dan memutarnya kembali saat beban puncak',
      'Penyedot lumpur got perkotaan otomatis',
      'Pemanas air kolam renang komersial',
      'Filter penyaring air minum dalam kemasan',
      'A',
      'Pumped storage menyumbang lebih dari 90% kapasitas penyimpanan energi global dengan memompa air saat listrik murah dan melepasnya saat puncak.',
      'Hydroelectric Engineering Handbook', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q067', 'Renewable Energy', 'Hard',
      'Apa yang dimaksud dengan "Curtailment" dalam operasional pembangkit energi terbarukan?',
      'Pembatasan atau pemotongan sengaja keluaran daya EBT oleh operator grid ketika produksi melebihi daya serap transmisi',
      'Pencucian modul panel surya dengan detergen keras',
      'Pengecatan ulang sudu turbin angin dengan warna terang',
      'Pemotongan kabel jumper cadangan pada panel kontrol',
      'A',
      'Curtailment terjadi saat kapasitas pembangkitan EBT melampaui kapasitas transmisi atau beban lokal; dapat dihindari dengan memasang baterai BESS.',
      'NREL Curtailment Technical Studies', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q068', 'Renewable Energy', 'Easy',
      'Negara dengan komitmen nol emisi menargetkan "Net Zero Emission" pada tahun 2050-2060. Apa arti sebenarnya?',
      'Keseimbangan antara jumlah gas rumah kaca yang dilepaskan dengan jumlah yang diserap kembali oleh alam atau teknologi',
      'Seluruh industri dilarang menggunakan listrik apa pun',
      'Semua pabrik di bumi dihancurkan dan ditutup selamanya',
      'Jumlah uang kas negara bernilai tepat nol rupiah',
      'A',
      'Net Zero bukan berarti nol emisi mutlak tanpa aktivitas manusia, melainkan emisi residual yang tak terhindarkan dinetralkan seimbang (net-zero balance).',
      'IPCC Special Report 1.5C', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q069', 'Renewable Energy', 'Medium',
      'Apa keunggulan turbin angin lepas pantai (Offshore Wind) dibanding di daratan (Onshore)?',
      'Kecepatan angin di laut lebih konsisten, lebih kencang, dan tidak terhalang topografi perbukitan atau bangunan',
      'Turbin lepas pantai tidak memerlukan kabel listrik sama sekali',
      'Pondasi turbin laut tidak terkena korosi air asin',
      'Bisa dipasang tanpa menggunakan kapal tongkang',
      'A',
      'Angin laut memiliki profil kecepatan jauh lebih tinggi dan stabil tanpa friksi permukaan darat, menghasilkan faktor kapasitas (CF) hingga 50-60%.',
      'Offshore Wind Energy Technology', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q070', 'Renewable Energy', 'Hard',
      'Teknologi "Virtual Power Plant" (VPP) menghubungkan berbagai aset energi terdesentralisasi menggunakan...',
      'Platform piranti lunak berbasis cloud dan algoritma agregasi pintar untuk bertindak layaknya satu pembangkit besar',
      'Kawat jemuran tembaga yang direntangkan antar rumah',
      'Sinyal asap pembakaran jerami',
      'Surat pos kilat tercatat',
      'A',
      'VPP menggabungkan ribuan PLTS atap rumahan, baterai industri, dan mobil listrik menjadi satu entitas virtual yang dapat diperdagangkan di pasar listrik.',
      'Smart Energy Networks & VPP', 'VERIFIED', 'ACTIVE'
    ],

    // --- CATEGORY 4: ENVIRONMENTAL SUSTAINABILITY & CARBON [Q071 - Q085] ---
    [
      'Q071', 'Sustainability', 'Easy',
      'Gas rumah kaca paling dominan yang dihasilkan dari pembakaran bahan bakar fosil adalah...',
      'Karbon Dioksida (CO₂)',
      'Oksigen Murni (O₂)',
      'Argon (Ar)',
      'Helium (He)',
      'A',
      'CO₂ menyumbang sekitar 76% dari total emisi gas rumah kaca global akibat aktivitas pembakaran batu bara, minyak, dan gas alam.',
      'EPA Greenhouse Gas Inventory', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q072', 'Sustainability', 'Easy',
      'Pemanasan global memicu kenaikan suhu bumi yang berdampak pada...',
      'Mencairnya es kutub, kenaikan muka air laut, dan cuaca ekstrem',
      'Matahari terbit dari arah barat',
      'Gravitasi bumi berkurang menjadi melayang',
      'Warna langit berubah menjadi hijau muda',
      'A',
      'Kenaikan suhu global memicu anomali cuaca parah, gelombang panas, banjir bandang, kekeringan pertanian, dan kenaikan permukaan air laut.',
      'World Meteorological Organization (WMO)', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q073', 'Sustainability', 'Medium',
      'Apa yang dimaksud dengan "Jejak Karbon" (Carbon Footprint)?',
      'Total jumlah gas rumah kaca (dinyatakan dalam ekuivalen CO₂) yang dihasilkan oleh aktivitas individu, organisasi, atau produk',
      'Bekas jejak telapak kaki manusia di atas tumpukan abu arang batubara',
      'Jumlah mineral grafit yang ada di dalam pensil tulis',
      'Luas lantai pabrik yang dilapisi cat berwarna hitam',
      'A',
      'Jejak karbon mengukur total emisi gas rumah kaca sepanjang daur hidup (Life Cycle Assessment) dalam satuan CO₂e.',
      'GHG Protocol Corporate Standard', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q074', 'Sustainability', 'Medium',
      'Dalam standar internasional GHG Protocol, emisi "Scope 2" dari sebuah industri mencakup...',
      'Emisi tidak langsung yang timbul dari pembelian energi listrik, steam, dan pendingin dari penyedia luar',
      'Emisi langsung dari cerobong pipa reaktor milik sendiri',
      'Emisi perjalanan dinas pesawat terbang karyawan ke luar negeri',
      'Emisi sampah sisa makanan dari dapur kafetaria',
      'A',
      'Scope 1 adalah emisi langsung fasilitas sendiri; Scope 2 adalah emisi dari konsumsi listrik/utilitas yang dibeli; Scope 3 adalah rantai pasok hilir-hulu.',
      'GHG Protocol Standard', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q075', 'Sustainability', 'Hard',
      'Mekanisme perdagangan karbon (Carbon Trading) memungkinkan entitas industri untuk...',
      'Memperjualbelikan kuota emisi atau kredit karbon terverifikasi guna mendorong pengurangan emisi berbiaya terendah',
      'Menjual batu bara curah secara bebas di toko kelontong',
      'Menukar debu pembakaran dengan mata uang kripto palsu',
      'Memindahkan polusi udara ke ruangan tertutup',
      'A',
      'Bursa Karbon (seperti IDX Carbon di Indonesia) memfasilitasi transaksi unit karbon tersertifikasi (SPE-GRK) untuk mendorong dekarbonisasi industri.',
      'OJK & KLHK Regulasi Nilai Ekonomi Karbon', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q076', 'Sustainability', 'Easy',
      'Prinsip "3R" yang terkenal dalam pengelolaan limbah berkelanjutan adalah singkatan dari...',
      'Reduce (Kurangi), Reuse (Gunakan Kembali), Recycle (Daur Ulang)',
      'Run (Lari), Rest (Istirahat), Repeat (Ulangi)',
      'Read (Baca), Remember (Ingat), Review (Kaji)',
      'Refill (Isi), Reject (Tolak), Restart (Mulai)',
      'A',
      'Reduce mengurangi konsumsi awal; Reuse memperpanjang usia pakai barang; Recycle memproses material bekas menjadi produk baru.',
      'Waste Management Principles', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q077', 'Sustainability', 'Medium',
      'Konsep "Ekonomi Sirkular" (Circular Economy) bertujuan untuk menggantikan model ekonomi linier "Take-Make-Dispose" dengan cara...',
      'Merancang produk agar materialnya dapat terus digunakan kembali, diperbaiki, dan didaur ulang tanpa menghasilkan limbah akhir',
      'Membuang seluruh barang elektronik ke sungai setiap akhir pekan',
      'Membakar seluruh sampah industri di tempat terbuka',
      'Membuat produk dengan masa kedaluwarsa satu hari saja',
      'A',
      'Ekonomi sirkular menutup siklus hidup material melalui desain berkelanjutan, pemeliharaan, remanufaktur, dan daur ulang komprehensif.',
      'Ellen MacArthur Foundation', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q078', 'Sustainability', 'Easy',
      'Hutan mangrove di pesisir pantai sangat berharga bagi keberlanjutan bumi karena...',
      'Menyimpan cadangan karbon biru (Blue Carbon) berlipat ganda dibanding hutan darat dan mencegah abrasi gelombang laut',
      'Menjadi sarang bagi burung elang raksasa pemangsa manusia',
      'Menyerap air laut hingga habis kering tak bersisa',
      'Mengeluarkan gas karbon monoksida beracun ke udara',
      'A',
      'Blue Carbon pada ekosistem mangrove dan padang lamun mampu mengunci karbon di dalam sedimen lumpur selama ribuan tahun.',
      'Blue Carbon Global Initiative', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q079', 'Sustainability', 'Medium',
      'Kriteria investasi berkelanjutan "ESG" adalah singkatan dari...',
      'Environmental (Lingkungan), Social (Sosial), dan Governance (Tata Kelola)',
      'Economic, Strategic, Growth',
      'Electricity, Solar, Grid',
      'Energy, Steam, Gas',
      'A',
      'ESG adalah kerangka pengukuran kinerja non-keuangan yang menilai keberlanjutan etis dan dampak operasional perusahaan terhadap dunia.',
      'UN Global Compact', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q080', 'Sustainability', 'Hard',
      'Teknologi Carbon Capture and Storage (CCS / CCUS) bekerja dengan cara...',
      'Menangkap CO₂ langsung dari cerobong industri emisi tinggi, memampatkannya, lalu menginjeksinya aman ke formasi geologi bawah tanah dalam',
      'Menyaring karbon menggunakan kain kasa biasa di langit bebas',
      'Memasukkan gas CO₂ ke dalam balon pesta anak-anak',
      'Mengubah gas karbon menjadi debu pasir putih di jalan raya',
      'A',
      'CCS menangkap hingga 90% emisi CO₂ dari fasilitas industri berat sebelum diinjeksikan secara permanen ke reservoir migas tua atau akuifer asin dalam.',
      'IEA CCUS Technology Roadmap', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q081', 'Sustainability', 'Easy',
      'Tindakan sederhana sehari-hari apa yang dapat membantu mengurangi emisi gas rumah kaca keluarga kita?',
      'Mematikan lampu dan AC saat ruangan kosong serta bijak menggunakan listrik',
      'Menyalakan semua televisi di rumah sepanjang malam',
      'Membeli kantong plastik baru setiap 10 menit sekali',
      'Membakar tumpukan sampah plastik di halaman tetangga',
      'A',
      'Efisiensi energi domestik menurunkan kebutuhan pasokan listrik dari pembangkit fosil dan menghemat tagihan bulanan.',
      'Kementerian ESDM Konservasi Energi', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q082', 'Sustainability', 'Medium',
      'Apa nama kesepakatan internasional paling bersejarah tahun 2015 yang mengikat komitmen dunia menahan laju kenaikan suhu bumi di bawah 2°C?',
      'Persetujuan Paris (Paris Agreement)',
      'Protokol Kyoto Pertama',
      'Deklarasi Kemerdekaan Maritim Pasifik',
      'Perjanjian Antariksa Bulan Jenewa',
      'A',
      'Paris Agreement mengikat negara-negara dunia untuk menahan laju pemanasan global di bawah 2°C dan mengupayakan batas aman 1,5°C di atas masa pra-industri.',
      'UNFCCC Paris Agreement 2015', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q083', 'Sustainability', 'Medium',
      'Dokumen komitmen iklim yang diserahkan setiap negara anggota kepada PBB disebut...',
      'Nationally Determined Contribution (NDC)',
      'Nota Dinas Keuangan Internasional',
      'Passport Bebas Visa Pariwisata',
      'Kwitansi Pembelian Energi Tahunan',
      'A',
      'Enhanced NDC Indonesia menargetkan penurunan emisi GRK sendiri sebesar 31,89% dan hingga 43,2% dengan bantuan kemitraan internasional.',
      'Kementerian LHK Enhanced NDC', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q084', 'Sustainability', 'Hard',
      'Apa yang dimaksud dengan "Greenwashing"?',
      'Praktik menyesatkan di mana perusahaan membuat klaim ramah lingkungan palsu tanpa tindakan nyata yang substansial',
      'Mencuci panel surya dengan sabun pembersih berbusa banyak',
      'Mengecat dinding pabrik dengan warna hijau daun',
      'Menyirami tanaman hias di lobby kantor dengan air mineral',
      'A',
      'Greenwashing merugikan konsumen dan iklim; audit ESG independen diperlukan untuk membuktikan keaslian aksi keberlanjutan suatu institusi.',
      'Consumer Protection & ESG Transparency', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q085', 'Sustainability', 'Easy',
      'Konsep "Pembangunan Berkelanjutan" (Sustainable Development) diartikan sebagai...',
      'Pembangunan yang memenuhi kebutuhan generasi saat ini tanpa mengorbankan kemampuan generasi masa depan memenuhi kebutuhan mereka',
      'Pembangunan gedung bertingkat setinggi-tingginya sampai menembus awan',
      'Penebangan seluruh hutan lindung untuk mendirikan pabrik semen',
      'Pemberhentian total seluruh kegiatan ekonomi di muka bumi',
      'A',
      'Definisi klasik dari Brundtland Report (1987) "Our Common Future" menyelaraskan tiga pilar: ekonomi, sosial, dan kelestarian ekologis.',
      'Brundtland Report UN 1987', 'VERIFIED', 'ACTIVE'
    ],

    // --- CATEGORY 5: ENERGY EFFICIENCY & SMART INDUSTRIAL GRID [Q086 - Q100] ---
    [
      'Q086', 'Energy Efficiency', 'Easy',
      'Apa perbedaan mendasar antara "Konservasi Energi" dan "Efisiensi Energi"?',
      'Konservasi adalah perilaku mengurangi konsumsi, sedangkan efisiensi adalah menggunakan teknologi untuk hasil yang sama dengan energi lebih sedikit',
      'Konservasi artinya mematikan listrik selamanya, efisiensi artinya menyalakan genset',
      'Keduanya sama persis tanpa perbedaan arti bahasa apa pun',
      'Konservasi hanya berlaku untuk hewan langka, efisiensi hanya untuk uang tunai',
      'A',
      'Efisiensi energi memakai peralatan canggih (misal LED vs pijar) agar output cahaya tetap terang tetapi daya listrik hemat hingga 85%.',
      'ISO 50001 Energy Management', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q087', 'Energy Efficiency', 'Easy',
      'Lampu penerangan modern manakah yang paling hemat energi dan berumur paling panjang untuk industri?',
      'Lampu LED (Light Emitting Diode)',
      'Lampu Pijar Filamen Kawat Wolfram',
      'Lampu Minyak Tanah Tradisional',
      'Lampu Lilin Parafin',
      'A',
      'LED mengubah hingga 80-90% energinya menjadi cahaya (bukan panas terbuang) dan memiliki umur pakai di atas 50.000 jam.',
      'Illuminating Engineering Society (IES)', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q088', 'Energy Efficiency', 'Medium',
      'Pada motor listrik industri, perangkat apa yang dipasang untuk mengatur kecepatan putar motor sesuai beban aktual sehingga menghemat energi?',
      'Variable Frequency Drive (VFD / Inverter Motor)',
      'Rem Tromol Mekanik Gesek',
      'Kran Katup Baut Manual',
      'Sekering Kawat Pengaman Lebur',
      'A',
      'VFD mengatur frekuensi tegangan ke motor induksi; menurunkan kecepatan motor pompa/fan 20% dapat menghemat daya listrik hingga ~50% (Hukum Afinitas).',
      'Industrial Motor Systems Best Practices', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q089', 'Energy Efficiency', 'Hard',
      'Standar manajemen internasional untuk perbaikan berkelanjutan kinerja energi organisasi adalah...',
      'ISO 50001',
      'ISO 9001',
      'ISO 14001',
      'ISO 45001',
      'A',
      'ISO 50001 menyediakan kerangka kerja sistematis untuk mengukur, memonitor, dan merekayasa efisiensi konsumsi energi industri.',
      'International Organization for Standardization', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q090', 'Energy Efficiency', 'Medium',
      'Faktor Daya (Power Factor / Cos Phi) pada industri kimia dan baja harus dijaga mendekati angka...',
      '1.0 (Unity Power Factor)',
      '0.1 (Sangat Rendah)',
      '100.0 (Kelipatan Ratusan)',
      'Nilai negatif minus 5',
      'A',
      'Power Factor mendekati 1.0 meminimalkan arus reaktif (kVARh) yang tidak berguna, mengurangi rugi transmisi kabel, dan menghindari denda penalti PLN.',
      'Electrical Power Distribution Engineering', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q091', 'Energy Efficiency', 'Medium',
      'Kompensasi daya reaktif pada instalasi kelistrikan pabrik umumnya dilakukan dengan memasang bank...',
      'Kapasitor Bank (Capacitor Bank)',
      'Resistor Pemanas Ruangan',
      'Kumparan Solenoida Terbuka',
      'Aki Asam 12V Mobil',
      'A',
      'Capacitor bank menyuplai daya reaktif magnetisasi lokal sehingga arus reaktif tidak perlu ditarik dari grid transmisi utama.',
      'Industrial Power System Protection', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q092', 'Energy Efficiency', 'Easy',
      'Apa tujuan utama dilakukannya Audit Energi (Energy Audit) pada fasilitas pabrik?',
      'Mengidentifikasi titik-titik pemborosan energi dan menyusun rekomendasi langkah penghematan terukur',
      'Menghitung jumlah kendaraan bermotor yang terparkir di pos satpam',
      'Memeriksa kebersihan kacamata hitam karyawan',
      'Membuat daftar menu makanan di kantin pabrik',
      'A',
      'Audit energi profesional menganalisis neraca massa dan energi untuk menemukan potensi penghematan biaya listrik dan bahan bakar puluhan persen.',
      'Panduan Audit Energi ESDM', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q093', 'Energy Efficiency', 'Hard',
      'Sistem "Kogenerasi" atau Combined Heat and Power (CHP) memiliki efisiensi termal tinggi karena...',
      'Memproduksi listrik sekaligus memanfaatkan sisa panas buang (exhaust heat) turbin untuk membangkitkan steam uap proses industri',
      'Menggunakan dua jenis batubara berbeda secara bersamaan',
      'Mematikan semua lampu pabrik saat turbin gas menyala',
      'Menyimpan uap air panas di dalam botol termos plastik',
      'A',
      'Kogenerasi (CHP) mencapai efisiensi total hingga 75-85%, jauh lebih unggul dibandingkan pembangkit listrik konvensional yang membuang 60% energi sebagai kalor panas.',
      'Combined Heat and Power Partnership EPA', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q094', 'Energy Efficiency', 'Medium',
      'Alat pemantau konsumsi energi digital berbasis IoT yang dipasang di setiap panel distribusi cabang disebut...',
      'Digital Smart Power Meter / Digital Sub-metering',
      'Termometer Raksa Laboratorium Kimia',
      'Penggaris Siku Pengukur Sudut',
      'Kertas Lakmus Penguji Asam',
      'A',
      'Sub-metering memungkinkan manajemen energi melihat pemakaian daya tiap mesin secara terperinci, mendeteksi anomali konsumsi seketika.',
      'Smart Industrial Automation', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q095', 'Energy Efficiency', 'Easy',
      'Mengapa insulasi termal pada pipa saluran uap (steam pipes) pabrik harus dijaga dalam kondisi prima?',
      'Mencegah kehilangan kalor panas uap ke udara bebas sehingga bahan bakar boiler jauh lebih hemat',
      'Supaya pipa terlihat mengkilap dan indah untuk berfoto',
      'Agar pipa uap tidak terkena air hujan saat mendung',
      'Supaya kucing liar tidak melompat di atas pipa',
      'A',
      'Pipa steam tanpa isolasi membuang energi panas bernilai miliaran rupiah per tahun dan meningkatkan risiko bahaya luka bakar bagi pekerja.',
      'Steam System Efficiency Best Practices', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q096', 'Energy Efficiency', 'Hard',
      'Apa peran teknologi "Digital Twin" dalam pengelolaan fasilitas pembangkit dan kelistrikan cerdas?',
      'Replika digital virtual berbasis AI dan sensor real-time untuk mensimulasikan dan mengoptimalkan performa pembangkit fisik tanpa risiko',
      'Dua orang teknisi kembar yang bekerja di ruang operator',
      'Dua buah printer cetak dokumen yang diletakkan bersebelahan',
      'Kabel ground cadangan yang diletakkan di dalam laci meja',
      'A',
      'Digital Twin memanfaatkan data sensor langsung untuk memprediksi kerusakan mesin (predictive maintenance) dan mencari titik efisiensi optimal.',
      'Industrial IoT and Digital Twin Technology', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q097', 'Energy Efficiency', 'Medium',
      'Mengapa isolasi kebocoran sistem udara bertekanan (compressed air leaks) sangat penting di fasilitas manufaktur?',
      'Udara bertekanan adalah salah satu utilitas paling boros energi; kebocoran kecil pada lubang 3mm dapat membuang daya puluhan juta rupiah',
      'Karena angin yang bocor bisa meniup topi pekerja hingga terbang',
      'Karena udara bertekanan berbau harum menyengat',
      'Karena kompresor udara tidak memerlukan motor listrik',
      'A',
      'Hanya sekitar 10-15% energi listrik kompresor yang berubah menjadi energi udara berguna; kebocoran udara bertekanan merupakan pemborosan terbesar di pabrik.',
      'Compressed Air Challenge Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q098', 'Energy Efficiency', 'Easy',
      'Gedung perkantoran ramah lingkungan modern menerapkan konsep "Green Building" yang ditandai dengan...',
      'Ventilasi alami, pencahayaan matahari hemat energi, sensor gerak pintar, dan panel surya atap',
      'Seluruh dinding gedung dicat dengan cat minyak warna hijau tua',
      'Gedung tidak dipasang pintu dan jendela kaca',
      'Gedung tidak dialiri arus listrik sama sekali',
      'A',
      'Green Building disertifikasi oleh institusi seperti Green Building Council Indonesia (GBCI) dengan sertifikasi Greenship.',
      'GBCI Green Building Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q099', 'Energy Efficiency', 'Medium',
      'Sistem pendingin gedung (Chiller) dengan pendinginan air (Water-Cooled Chiller) lebih efisien dibanding Air-Cooled karena...',
      'Kapasitas kalor air jauh lebih tinggi daripada udara sehingga perpindahan panas kondensor lebih efektif',
      'Air tidak memerlukan pipa sirkulasi tertutup',
      'Udara di perkotaan tidak memiliki massa jenis',
      'Chiller air tidak memerlukan kompresor refrigeran',
      'A',
      'Water-cooled chiller memiliki efisiensi kW/TR yang jauh lebih unggul pada sistem kapasitas besar di lingkungan tropis lembab.',
      'ASHRAE HVAC Design Guidelines', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q100', 'Energy Efficiency', 'Hard',
      'Integrasi menyeluruh antara PLTS, BESS, Kogenerasi, dan Smart Grid di Krakatau Chandra Energi bertujuan mewujudkan...',
      'Ekosistem kawasan industri hijau yang berdaya saing tinggi, rendah karbon, andal 24/7, dan berkelanjutan menuju Net Zero Emission',
      'Penghapusan seluruh aktivitas manufaktur di pulau Jawa',
      'Kenaikan biaya listrik industri setinggi mungkin tanpa kendali',
      'Penutupan total seluruh akses pelabuhan laut industri',
      'A',
      'Integrasi energi bersih KCE membuktikan bahwa keandalan tinggi dan kelestarian ekologis dapat berjalan harmonis menopang pertumbuhan industri nasional.',
      'KCE Master Plan 2030', 'VERIFIED', 'ACTIVE'
    ],
    // --- SOLAR POWER PLANTS EXPANSION [Q101 - Q105] ---
    [
      'Q101', 'Solar Power Plants', 'Easy',
      'Pada PLTS, rangkaian beberapa modul surya yang dihubungkan secara seri sehingga membentuk satu jalur kelistrikan disebut...',
      'String (Rangkaian Seri Modul)',
      'Busbar Hidrolik',
      'Rotor Generator',
      'Penukar Panas (Heat Exchanger)',
      'A',
      'Modul surya yang disusun seri dalam satu string akan menjumlahkan tegangannya, sehingga tegangan string dapat disesuaikan dengan rentang kerja input inverter.',
      'Solar Engineering Basics', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q102', 'Solar Power Plants', 'Medium',
      'Apa dampak menghubungkan beberapa modul surya secara SERI dibanding PARALEL?',
      'Tegangan total bertambah sedangkan arus tetap sama dengan satu modul',
      'Arus total bertambah sedangkan tegangan tetap sama dengan satu modul',
      'Daya modul otomatis menjadi nol',
      'Frekuensi listrik berubah menjadi 100 Hz',
      'A',
      'Hubungan seri menjumlahkan tegangan (V) dengan arus (A) yang sama, sedangkan hubungan paralel menjumlahkan arus dengan tegangan yang sama.',
      'Solar Components Handbook', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q103', 'Solar Power Plants', 'Medium',
      'Selain panel surya dan inverter, komponen apa yang umumnya wajib ada pada sistem PLTS Off-Grid?',
      'Baterai penyimpan energi dan solar charge controller',
      'Meteran kWh ekspor-impor PLN saja',
      'Turbin uap dan kondensor',
      'Boiler batubara berkapasitas kecil',
      'A',
      'Sistem Off-Grid tidak terhubung ke jaringan PLN, sehingga membutuhkan baterai untuk menyimpan energi dan charge controller untuk mengatur pengisian baterai.',
      'Off-Grid Solar Design Guide', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q104', 'Solar Power Plants', 'Hard',
      'Penurunan produksi energi modul surya secara bertahap sepanjang umur pakainya disebut degradasi. Berapa kisaran degradasi tahunan modul silikon berkualitas?',
      'Sekitar 0,5% - 0,7% per tahun',
      'Sekitar 20% - 30% per tahun',
      'Sekitar 50% per tahun',
      'Tidak pernah terjadi degradasi sama sekali',
      'A',
      'Modul silikon berkualitas umumnya mengalami degradasi sekitar 0,5-0,7% per tahun, sehingga garansi performa linear 25-30 tahun masih menjamin output sekitar 80-87% dari kapasitas awal.',
      'Solar Module Warranty Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q105', 'Solar Power Plants', 'Medium',
      'Untuk lokasi di Banten (sekitar 6° Lintang Selatan), ke arah mana panel surya sebaiknya dihadapkan agar produksi tahunan optimal?',
      'Menghadap ke arah utara dengan kemiringan kecil',
      'Menghadap ke arah selatan dengan kemiringan curam',
      'Menghadap vertikal ke tanah',
      'Menghadap ke arah barat dengan kemiringan 90 derajat',
      'A',
      'Di belahan bumi selatan, lintasan matahari condong ke utara, sehingga panel optimal menghadap utara. Dekat khatulistiwa kemiringan cukup kecil (sekitar 10-15 derajat) agar air hujan mengalir dan debu terbilas.',
      'PV Siting & Orientation Guide', 'VERIFIED', 'ACTIVE'
    ],
    // --- CATEGORY 6: ELECTRIC SERVICES [Q106 - Q110] ---
    [
      'Q106', 'Electric Services', 'Easy',
      'Sertifikat apakah yang diperlukan agar instalasi tenaga listrik baru dinyatakan laik dan boleh dioperasikan secara resmi di Indonesia?',
      'Sertifikat Laik Operasi (SLO)',
      'Sertifikat Kelulusan Ujian Sekolah',
      'Sertifikat Keanggotaan Klub Olahraga',
      'Sertifikat Hak Cipta Musik',
      'A',
      'SLO diterbitkan oleh lembaga inspeksi teknik terakreditasi setelah instalasi diperiksa dan diuji sesuai standar keselamatan ketenagalistrikan.',
      'Regulasi Keselamatan Ketenagalistrikan', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q107', 'Electric Services', 'Medium',
      'Apa tujuan utama inspeksi thermography (kamera inframerah) pada panel listrik, switchgear, maupun modul surya?',
      'Mendeteksi titik panas (hotspot) akibat sambungan longgar atau komponen bermasalah tanpa harus memadamkan sistem',
      'Mengukur kecepatan angin di sekitar instalasi',
      'Menghitung jumlah karyawan di dalam gedung',
      'Mengubah warna kabel menjadi lebih terang',
      'A',
      'Thermography adalah uji non-kontak yang memetakan suhu permukaan, sehingga hotspot dapat ditemukan dini sebelum berkembang menjadi kerusakan atau kebakaran.',
      'Predictive Maintenance Handbook', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q108', 'Electric Services', 'Hard',
      'Alat Megger (insulation resistance tester) pada jasa pengujian kelistrikan digunakan untuk...',
      'Mengukur tahanan isolasi kabel, motor, dan trafo untuk memastikan isolasi masih baik',
      'Mengukur kecerahan lampu penerangan',
      'Mengukur kadar oksigen di udara',
      'Menghitung tagihan listrik bulanan',
      'A',
      'Pengujian tahanan isolasi dengan tegangan DC tinggi mendeteksi degradasi isolasi sehingga kebocoran arus dan gangguan hubung singkat dapat dicegah.',
      'Electrical Testing Standards', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q109', 'Electric Services', 'Medium',
      'Mengapa banyak pelanggan industri memasang kapasitor bank untuk perbaikan faktor daya (power factor correction)?',
      'Mengurangi daya reaktif sehingga efisiensi meningkat dan terhindar dari denda kelebihan kVARh',
      'Menambah jumlah fasa listrik menjadi sepuluh',
      'Mengubah listrik AC menjadi gas alam',
      'Menghentikan seluruh konsumsi listrik pabrik',
      'A',
      'Beban induktif seperti motor menarik daya reaktif; kapasitor bank menyuplai daya reaktif lokal sehingga arus jaringan dan rugi-rugi berkurang serta faktor daya mendekati 1.',
      'Industrial Power Quality Guide', 'VERIFIED', 'ACTIVE'
    ],
    [
      'Q110', 'Electric Services', 'Easy',
      'Apa perbedaan utama pemeliharaan preventif (preventive maintenance) dibanding pemeliharaan korektif?',
      'Preventif dilakukan terjadwal sebelum kerusakan terjadi, sedangkan korektif dilakukan setelah terjadi kerusakan',
      'Preventif hanya dilakukan setelah peralatan rusak total',
      'Keduanya sama persis tanpa perbedaan',
      'Preventif berarti peralatan dibiarkan sampai tidak berfungsi',
      'A',
      'Pemeliharaan preventif (inspeksi, pembersihan, pengujian berkala) menekan risiko gangguan mendadak, sedangkan korektif adalah perbaikan setelah kegagalan terjadi. Ini inti layanan O&M.',
      'Asset Management Basics', 'VERIFIED', 'ACTIVE'
    ]
  ];
}
