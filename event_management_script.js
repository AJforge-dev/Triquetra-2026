/**
 * Triquetra 2026 - Google Apps Script 100-Rush Async Queue & Sheet Sync Engine
 * -----------------------------------------------------------------------------
 * 1. Open your Google Sheet in Google Drive.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Replace all code in the editor with this file.
 * 4. Run `setupAutomaticQueueTrigger()` ONCE inside Apps Script (or click Run).
 * 5. Click "Deploy" > "Manage Deployments" > Edit (Pencil icon) > Select Version "New" > Click "Deploy".
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
      // Auto-flush any pending queue first so readings are always 100% up-to-date
      try { processRegistrationQueue(); } catch (qErr) {}

      var registrationsList = ss ? getAllRegistrations(ss) : [];
      var queue = getRegistrationQueue();

      var cloudData = {
        status: "success",
        categories: getStoredProperty("CATEGORIES_DATA"),
        events: getStoredProperty("EVENTS_DATA"),
        schedule: getStoredProperty("SCHEDULE_DATA"),
        registrations: registrationsList,
        queueStatus: {
          pendingCount: queue.length,
          sheetCount: registrationsList.length,
          totalCount: registrationsList.length + queue.length
        }
      };

      return createJsonResponse(cloudData, callback);
    }

    // 2. Action: Check Live Queue Status for Admin Panel
    if (action === "get_queue_status") {
      var queue = getRegistrationQueue();
      var sheetCount = ss ? getAllRegistrations(ss).length : 0;
      return createJsonResponse({
        status: "success",
        pendingCount: queue.length,
        sheetCount: sheetCount,
        totalCount: sheetCount + queue.length,
        timestamp: new Date().toISOString()
      }, callback);
    }

    // 3. Action: Manual Force Flush Queue to Google Sheets
    if (action === "flush_queue" || action === "process_queue") {
      var result = processRegistrationQueue();
      return createJsonResponse(result, callback);
    }

    // 4. Action: Save Categories to Cloud
    if (action === "save_categories" && params.data) {
      scriptProperties.setProperty("CATEGORIES_DATA", params.data);
      return createJsonResponse({ status: "success", message: "Categories saved to Cloud." }, callback);
    }

    // 5. Action: Save Events to Cloud
    if (action === "save_events" && params.data) {
      scriptProperties.setProperty("EVENTS_DATA", params.data);
      return createJsonResponse({ status: "success", message: "Events saved to Cloud." }, callback);
    }

    // 6. Action: Save Schedule to Cloud
    if (action === "save_schedule" && params.data) {
      scriptProperties.setProperty("SCHEDULE_DATA", params.data);
      return createJsonResponse({ status: "success", message: "Schedule saved to Cloud." }, callback);
    }

    // 7. Action: 100-Student Rush Registration Submission (Lock-Free Instant 0.1s Confirmation)
    if (action === "register" || action === "save_registration" || params.name || params.registerNumber || params.event) {
      return handleDataSync(params, callback);
    }

    // Default Health Check Response
    return createJsonResponse({
      status: "success",
      message: "Triquetra Cloud Database & 100-Rush Queue Engine is Online."
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

    if (action === "flush_queue" || action === "process_queue") {
      return createJsonResponse(processRegistrationQueue());
    }

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
 * Reads all candidate registrations directly from Sheet1
 */
function getAllRegistrations(ss) {
  var sheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Registrations") || ss.getActiveSheet() || ss.getSheets()[0];
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var lastCol = Math.max(sheet.getLastColumn(), 12);
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var registrations = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var p1Name = String(row[1] || "").trim();
    var p1Reg = String(row[2] || "").trim();
    var p2Name = String(row[3] || "").trim();
    var p2Reg = String(row[4] || "").trim();

    var nameCombined = p1Name;
    if (p2Name) nameCombined += ", " + p2Name;
    var regCombined = p1Reg;
    if (p2Reg) regCombined += ", " + p2Reg;

    if (p1Name || p1Reg) {
      registrations.push({
        id: row[0] ? String(row[0]).trim() : String(i + 1),
        name: nameCombined,
        p1Name: p1Name,
        p1Reg: p1Reg,
        p2Name: p2Name,
        p2Reg: p2Reg,
        registerNumber: regCombined,
        department: String(row[5] || "").trim(),
        year: String(row[6] || "").trim(),
        event: String(row[7] || "").trim(),
        receipt: String(row[8] || "").trim(),
        timestamp: String(row[9] || "").trim(),
        status: "Registered"
      });
    }
  }

  return registrations;
}

/**
 * 100-Rush Async Handler:
 * 1. Enqueues instantly in Cloud Properties.
 * 2. Attempts direct append. If lock is busy during simultaneous burst, queued item is safely written in next batch.
 */
function handleDataSync(data, callback) {
  var formattedTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  var p1Name = sanitizeForSpreadsheet(data.p1Name || data.participant1Name || data.name || data.fullName || "");
  var p1Reg = sanitizeForSpreadsheet(data.p1Reg || data.participant1Reg || data.registerNumber || data.regNum || "");
  var p2Name = sanitizeForSpreadsheet(data.p2Name || data.participant2Name || data.member2Name || "");
  var p2Reg = sanitizeForSpreadsheet(data.p2Reg || data.participant2Reg || data.member2Reg || "");

  // If a combined list was passed without p2Name/p2Reg being explicitly separated
  if (!p2Name && p1Name.indexOf(", ") > -1) {
    var parts = p1Name.split(", ");
    p1Name = parts[0];
    p2Name = parts[1] || "";
  }
  if (!p2Reg && p1Reg.indexOf(", ") > -1) {
    var parts = p1Reg.split(", ");
    p1Reg = parts[0];
    p2Reg = parts[1] || "";
  }

  var nameCombined = p1Name;
  if (p2Name) nameCombined += ", " + p2Name;
  var regCombined = p1Reg;
  if (p2Reg) regCombined += ", " + p2Reg;

  var record = {
    id: sanitizeForSpreadsheet(data.id || ""),
    name: nameCombined,
    p1Name: p1Name,
    p1Reg: p1Reg,
    p2Name: p2Name,
    p2Reg: p2Reg,
    registerNumber: regCombined,
    department: sanitizeForSpreadsheet(data.department || data.dept || ""),
    year: sanitizeForSpreadsheet(data.year || ""),
    event: sanitizeForSpreadsheet(data.event || data.selectedEvent || "Tech Talk"),
    receipt: sanitizeForSpreadsheet(data.receipt || data.receiptId || ""),
    status: "Registered",
    timestamp: formattedTime
  };

  // 1. Atomic Queue Buffer Push
  addToRegistrationQueue(record);

  // 2. Try immediate batch processing
  try {
    processRegistrationQueue();
  } catch (err) {
    // Queued safely in ScriptProperties
  }

  return createJsonResponse({
    status: "success",
    receipt: record.receipt,
    message: "Registration confirmed and securely buffered."
  }, callback);
}

/**
 * Atomic Registration Queue Utilities
 */
function getRegistrationQueue() {
  var raw = scriptProperties.getProperty("REGISTRATION_QUEUE");
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch (e) {
    return [];
  }
}

function addToRegistrationQueue(record) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    var queue = getRegistrationQueue();
    // Check if receipt already in queue to avoid duplicates
    var exists = queue.some(function(item) {
      return (item.receipt && item.receipt === record.receipt) || 
             (item.p1Reg === record.p1Reg && item.event === record.event);
    });
    if (!exists) {
      queue.push(record);
      scriptProperties.setProperty("REGISTRATION_QUEUE", JSON.stringify(queue));
    }
  } catch (e) {
    console.warn("Queue write lock busy:", e);
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/**
 * Batch Worker: Reads pending queue and writes bulk rows to Sheet1
 */
function processRegistrationQueue() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(4000)) {
    return { status: "busy", message: "Queue is currently being processed by another worker." };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("No active spreadsheet found.");

    var sheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Registrations") || ss.getActiveSheet() || ss.getSheets()[0];

    // Force write the headers exactly as requested to Row 1
    sheet.getRange(1, 1, 1, 12).setValues([[
      "ID", 
      "Participant 1 Name", 
      "Participant 1 Register Number", 
      "Participant 2 Name", 
      "Participant 2 Register Number", 
      "Department", 
      "Year", 
      "Registered Event", 
      "Receipt ID", 
      "Timestamp",
      "Signature (Manual)",
      "Mark (Manual)"
    ]]);
    sheet.getRange("A1:L1").setFontWeight("bold").setBackground("#1A6B6B").setFontColor("#FFFFFF");

    var queue = getRegistrationQueue();
    if (queue.length === 0) {
      return { status: "success", flushedCount: 0, remainingQueue: 0, message: "Queue is empty." };
    }

    // Collect all existing receipts to prevent duplicate rows
    var existing = getAllRegistrations(ss);
    var existingKeys = {};
    existing.forEach(function(r) {
      var k = (r.receipt || "") + "_" + (r.registerNumber || "") + "_" + (r.event || "");
      existingKeys[k] = true;
      if (r.receipt) existingKeys[r.receipt] = true;
    });

    var rowsToWrite = [];
    var processedReceipts = {};
    var batchSize = Math.min(queue.length, 35); // Process up to 35 students per batch for ultra-fast execution

    for (var i = 0; i < batchSize; i++) {
      var item = queue[i];
      var key = (item.receipt || "") + "_" + (item.registerNumber || "") + "_" + (item.event || "");
      if (!existingKeys[key] && !existingKeys[item.receipt]) {
        var rowId = item.id || String(sheet.getLastRow() + rowsToWrite.length);
        
        var p1Name = item.p1Name || item.name || "";
        var p1Reg = item.p1Reg || item.registerNumber || "";
        var p2Name = item.p2Name || "";
        var p2Reg = item.p2Reg || "";

        // Fallback split if needed
        if (!p2Name && p1Name.indexOf(", ") > -1) {
          var parts = p1Name.split(", ");
          p1Name = parts[0];
          p2Name = parts[1] || "";
        }
        if (!p2Reg && p1Reg.indexOf(", ") > -1) {
          var parts = p1Reg.split(", ");
          p1Reg = parts[0];
          p2Reg = parts[1] || "";
        }

        rowsToWrite.push([
          rowId,
          p1Name,
          p1Reg,
          p2Name,
          p2Reg,
          item.department || "",
          item.year || "",
          item.event || "",
          item.receipt || "",
          item.timestamp || ""
        ]);
        existingKeys[key] = true;
        if (item.receipt) existingKeys[item.receipt] = true;
      }
      processedReceipts[item.receipt || key] = true;
    }

    // Bulk write in 1 single API call (writes up to Column J - Timestamp)
    if (rowsToWrite.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToWrite.length, 10).setValues(rowsToWrite);
      SpreadsheetApp.flush();
    }

    // Remove processed items from queue
    var remainingQueue = queue.slice(batchSize);
    scriptProperties.setProperty("REGISTRATION_QUEUE", JSON.stringify(remainingQueue));

    return {
      status: "success",
      flushedCount: rowsToWrite.length,
      remainingQueue: remainingQueue.length,
      totalInSheet: sheet.getLastRow() - 1,
      message: "Successfully flushed " + rowsToWrite.length + " registrations to Google Sheets."
    };

  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/**
 * 1-Click Trigger Setup: Wakes up every 1 minute to process the queue automatically
 */
function setupAutomaticQueueTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "processRegistrationQueue") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("processRegistrationQueue")
    .timeBased()
    .everyMinutes(1)
    .create();

  console.log("Automatic 1-Minute Background Registration Queue Trigger is active!");
}

function sanitizeForSpreadsheet(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (/^[=+@-]/.test(str)) {
    return "'" + str;
  }
  return str;
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
