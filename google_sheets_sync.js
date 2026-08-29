/**
 * Triquetra 2026 - Google Apps Script Cloud Backend & Sheet Sync (Updated)
 * ------------------------------------------------------------------
 * 1. Open your Google Sheet in Google Drive (e.g. "Symposium -AI&DS").
 * 2. Click "Extensions" > "Apps Script".
 * 3. Replace all code in the editor with this file.
 * 4. Click "Deploy" > "Manage Deployments" > Edit (Pencil icon) > Select Version "New" > Click "Deploy".
 *    (Make sure "Execute as: Me" and "Who has access: Anyone").
 */

// Global Cloud Properties Service
var scriptProperties = PropertiesService.getScriptProperties();

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "";
    var callback = params.callback || "";

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Action: Fetch all Cloud Data (Categories, Events, Schedule, and LIVE Registrations from Sheet1)
    if (action === "get_data" || action === "get_registrations" || action === "read") {
      var registrationsList = ss ? getAllRegistrations(ss) : [];

      var cloudData = {
        status: "success",
        categories: getStoredProperty("CATEGORIES_DATA"),
        events: getStoredProperty("EVENTS_DATA"),
        schedule: getStoredProperty("SCHEDULE_DATA"),
        registrations: registrationsList
      };

      return createJsonResponse(cloudData, callback);
    }

    // 2. Action: Save Categories to Cloud
    if (action === "save_categories" && params.data) {
      scriptProperties.setProperty("CATEGORIES_DATA", params.data);
      return createJsonResponse({ status: "success", message: "Categories saved to Cloud." }, callback);
    }

    // 3. Action: Save Events to Cloud
    if (action === "save_events" && params.data) {
      scriptProperties.setProperty("EVENTS_DATA", params.data);
      return createJsonResponse({ status: "success", message: "Events saved to Cloud." }, callback);
    }

    // 4. Action: Save Schedule to Cloud
    if (action === "save_schedule" && params.data) {
      scriptProperties.setProperty("SCHEDULE_DATA", params.data);
      return createJsonResponse({ status: "success", message: "Schedule saved to Cloud." }, callback);
    }

    // 5. Action: Registration submission via GET query params
    if (action === "register" || action === "save_registration" || params.name || params.registerNumber || params.event) {
      return handleDataSync(params, callback);
    }

    // Default Health Check Response
    return createJsonResponse({
      status: "success",
      message: "Triquetra Cloud Database is Online and Connected."
    }, callback);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.message
    }, (e && e.parameter) ? e.parameter.callback : "");
  }
}

function doPost(e) {
  try {
    var data = null;
    var params = (e && e.parameter) ? e.parameter : {};

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = parseQueryString(e.postData.contents);
      }
    } else if (params && Object.keys(params).length > 0) {
      data = params;
    }

    if (!data) {
      throw new Error("No data payload received.");
    }

    var action = data.action || params.action || "";

    if (action === "save_categories" && data.data) {
      var catStr = (typeof data.data === "object") ? JSON.stringify(data.data) : data.data;
      scriptProperties.setProperty("CATEGORIES_DATA", catStr);
      return createJsonResponse({ status: "success", message: "Categories saved to Cloud." });
    }

    if (action === "save_events" && data.data) {
      var evtStr = (typeof data.data === "object") ? JSON.stringify(data.data) : data.data;
      scriptProperties.setProperty("EVENTS_DATA", evtStr);
      return createJsonResponse({ status: "success", message: "Events saved to Cloud." });
    }

    if (action === "save_schedule" && data.data) {
      var schStr = (typeof data.data === "object") ? JSON.stringify(data.data) : data.data;
      scriptProperties.setProperty("SCHEDULE_DATA", schStr);
      return createJsonResponse({ status: "success", message: "Schedule saved to Cloud." });
    }

    return handleDataSync(data);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.message
    });
  }
}

/**
 * Reads all candidate registrations directly from Sheet1 (or Registrations / Active Sheet)
 */
function getAllRegistrations(ss) {
  var sheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Registrations") || ss.getActiveSheet() || ss.getSheets()[0];
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var lastCol = Math.max(sheet.getLastColumn(), 9);
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var registrations = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var name = String(row[1] || "").trim();
    var regNum = String(row[2] || "").trim();

    // Only include rows that have at least a participant name or register number
    if (name || regNum) {
      registrations.push({
        id: row[0] ? String(row[0]).trim() : String(i + 1),
        name: name,
        registerNumber: regNum,
        department: String(row[3] || "").trim(),
        year: String(row[4] || "").trim(),
        event: String(row[5] || "Tech Talk").trim(),
        receipt: String(row[6] || "").trim(),
        status: String(row[7] || "Registered").trim(),
        timestamp: String(row[8] || "").trim()
      });
    }
  }

  return registrations;
}

/**
 * Appends a new candidate registration into Sheet1 with sanitization
 */
function handleDataSync(data, callback) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("SpreadsheetApp.getActiveSpreadsheet() returned null. Ensure script is bound to a Google Sheet.");
  }

  // Get 'Sheet1' or 'Registrations' or Active Sheet
  var sheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Registrations") || ss.getActiveSheet() || ss.getSheets()[0];
  
  // Initialize Header row if sheet is brand new
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "ID", 
      "Participant Name", 
      "Register Number", 
      "Department", 
      "Year", 
      "Registered Event", 
      "Receipt ID", 
      "Registration Status", 
      "Timestamp"
    ]);
    sheet.getRange("A1:I1").setFontWeight("bold").setBackground("#1A6B6B").setFontColor("#FFFFFF");
  }

  // Formula Injection Sanitizer
  function sanitizeForSpreadsheet(val) {
    if (val === null || val === undefined) return "";
    var str = String(val).trim();
    if (/^[=+@-]/.test(str)) {
      return "'" + str;
    }
    return str;
  }

  var id = sanitizeForSpreadsheet(data.id || (sheet.getLastRow()));
  var name = sanitizeForSpreadsheet(data.name || data.fullName || "");
  var regNum = sanitizeForSpreadsheet(data.registerNumber || data.regNum || "");
  var dept = sanitizeForSpreadsheet(data.department || data.dept || "");
  var year = sanitizeForSpreadsheet(data.year || "");
  var event = sanitizeForSpreadsheet(data.event || data.selectedEvent || "Tech Talk");
  var receipt = sanitizeForSpreadsheet(data.receipt || data.receiptId || "");
  var status = sanitizeForSpreadsheet(data.status || "Registered");
  var formattedTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  sheet.appendRow([
    id,
    name,
    regNum,
    dept,
    year,
    event,
    receipt,
    status,
    formattedTime
  ]);

  SpreadsheetApp.flush();

  return createJsonResponse({
    status: "success",
    message: "Registration successfully synced to Google Sheet & Cloud."
  }, callback);
}

function getStoredProperty(key) {
  var val = scriptProperties.getProperty(key);
  if (val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function createJsonResponse(dataObj, callback) {
  var jsonString = JSON.stringify(dataObj);
  if (callback && callback.trim()) {
    return ContentService.createTextOutput(callback + "(" + jsonString + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

function parseQueryString(str) {
  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var split = pairs[i].split('=');
    if (split.length === 2) {
      obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1].replace(/\+/g, ' '));
    }
  }
  return obj;
}
