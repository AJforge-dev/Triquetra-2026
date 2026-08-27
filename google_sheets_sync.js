/**
 * Triquetra 2026 - Dedicated Event Management Google Sheet Backend
 * ==============================================================================
 * This script connects your symposium website to a SINGLE Google Sheet tab named:
 * "EventManagement"
 * 
 * It manages:
 * 1. Event Categories (Category names, descriptions, icons)
 * 2. Event Details (Event names, venues, timings, rules, fees, descriptions)
 * 3. Symposium Schedule (Day-wise timeline, dates, venues)
 * ==============================================================================
 * HOW TO SET UP:
 * 1. Open your Google Sheet in Google Drive.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any default code and paste this script.
 * 4. Click "Deploy" > "Manage Deployments" > Edit (Pencil) > Version "New" > Click "Deploy".
 *    (Make sure "Execute as: Me" and "Who has access: Anyone").
 * 5. Copy your Web App URL and paste it in app.js under "EVENT_MGMT_SCRIPT_URL".
 */

var scriptProperties = PropertiesService.getScriptProperties();
var SHEET_NAME = "EventManagement";
var HEADERS = ["Section", "Item Name / Key", "Category / Day", "Summary Details", "Raw Data JSON"];

function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (/^[=+@-]/.test(str)) return "'" + str;
  return str;
}

function getOrCreateMgmtSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var hRange = sheet.getRange(1, 1, 1, HEADERS.length);
    hRange.setFontWeight("bold");
    hRange.setBackground("#1A6B6B");
    hRange.setFontColor("#FFFFFF");
    hRange.setHorizontalAlignment("center");
  }
  return sheet;
}

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "";
    var callback = params.callback || "";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("Could not access active spreadsheet.");

    // Action 1: Get all live Event Management Data from Google Sheet
    if (action === "get_data") {
      var allData = readMgmtSheet(ss);
      return sendJsonResponse({
        status: "success",
        categories: allData.categories,
        events: allData.events,
        schedule: allData.schedule,
        registrations: allData.registrations
      }, callback);
    }

    // Action 2: Save Categories to Google Sheet
    if (action === "save_categories" && params.data) {
      var catData = JSON.parse(params.data);
      saveSection(ss, "Category", catData);
      scriptProperties.setProperty("CATEGORIES_DATA", params.data);
      return sendJsonResponse({ status: "success", message: "Categories saved to Google Sheet." }, callback);
    }

    // Action 3: Save Events to Google Sheet
    if (action === "save_events" && params.data) {
      var evtData = JSON.parse(params.data);
      saveSection(ss, "Event", evtData);
      scriptProperties.setProperty("EVENTS_DATA", params.data);
      return sendJsonResponse({ status: "success", message: "Events saved to Google Sheet." }, callback);
    }

    // Action 4: Save Schedule to Google Sheet
    if (action === "save_schedule" && params.data) {
      var schData = JSON.parse(params.data);
      saveSection(ss, "Schedule", schData);
      scriptProperties.setProperty("SCHEDULE_DATA", params.data);
      return sendJsonResponse({ status: "success", message: "Schedule saved to Google Sheet." }, callback);
    }

    // Action 5: Registration Fallback
    if (params.name || params.registerNumber || params.event) {
      var regSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Registrations") || ss.getSheets()[0];
      if (!regSheet) regSheet = ss.insertSheet("Sheet1");
      if (regSheet.getLastRow() === 0) {
        regSheet.appendRow(["ID", "Participant Name", "Register Number", "Department", "Year", "Registered Event", "Receipt ID", "Registration Status", "Timestamp"]);
      }
      regSheet.appendRow([
        sanitizeCell(params.id || ""),
        sanitizeCell(params.name || params.fullName || ""),
        sanitizeCell(params.registerNumber || params.regNum || ""),
        sanitizeCell(params.department || params.dept || ""),
        sanitizeCell(params.year || ""),
        sanitizeCell(params.event || params.selectedEvent || ""),
        sanitizeCell(params.receipt || params.receiptId || ""),
        sanitizeCell(params.status || "Registered"),
        new Date()
      ]);
      return sendJsonResponse({ status: "success", message: "Registration recorded." }, callback);
    }

    return sendJsonResponse({
      status: "success",
      message: "Triquetra Event Management Google Sheets API is Online."
    }, callback);

  } catch (err) {
    return sendJsonResponse({ status: "error", message: err.message }, (e && e.parameter) ? e.parameter.callback : "");
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("Could not access active spreadsheet.");

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

    if (!data) throw new Error("No payload received.");
    var action = data.action || params.action || "";

    if (action === "save_categories" && data.data) {
      var catObj = (typeof data.data === "object") ? data.data : JSON.parse(data.data);
      saveSection(ss, "Category", catObj);
      scriptProperties.setProperty("CATEGORIES_DATA", JSON.stringify(catObj));
      return sendJsonResponse({ status: "success", message: "Categories saved to Google Sheet." });
    }

    if (action === "save_events" && data.data) {
      var evtObj = (typeof data.data === "object") ? data.data : JSON.parse(data.data);
      saveSection(ss, "Event", evtObj);
      scriptProperties.setProperty("EVENTS_DATA", JSON.stringify(evtObj));
      return sendJsonResponse({ status: "success", message: "Events saved to Google Sheet." });
    }

    if (action === "save_schedule" && data.data) {
      var schObj = (typeof data.data === "object") ? data.data : JSON.parse(data.data);
      saveSection(ss, "Schedule", schObj);
      scriptProperties.setProperty("SCHEDULE_DATA", JSON.stringify(schObj));
      return sendJsonResponse({ status: "success", message: "Schedule saved to Google Sheet." });
    }

    return sendJsonResponse({ status: "success", message: "Payload processed." });

  } catch (err) {
    return sendJsonResponse({ status: "error", message: err.message });
  }
}

function readMgmtSheet(ss) {
  var sheet = getOrCreateMgmtSheet(ss);
  var lastRow = sheet.getLastRow();

  var categories = {};
  var events = {};
  var schedule = {};

  if (lastRow > 1) {
    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  for (var i = 0; i < data.length; i++) {
    var section = String(data[i][0] || "").trim();
    var key = String(data[i][1] || "").trim();
    var subKey = String(data[i][2] || "").trim();
    var jsonStr = String(data[i][4] || "").trim();

    var parsed = null;
    if (jsonStr) {
      try { parsed = JSON.parse(jsonStr); } catch (e) { parsed = null; }
    }

    if (section === "Category" && key) {
      categories[key] = parsed || {
        id: "cat-" + key.toLowerCase().replace(/\s+/g, "-"),
        name: key,
        desc: String(data[i][3] || ""),
        icon: "tag"
      };
    } else if (section === "Event" && key) {
      events[key] = parsed || {
        name: key,
        category: subKey || "General",
        desc: String(data[i][3] || ""),
        fee: "Free",
        rules: []
      };
    } else if (section === "Schedule" && subKey) {
      if (!schedule[subKey]) schedule[subKey] = [];
      schedule[subKey].push(parsed || {
        id: schedule[subKey].length + 1,
        time: key,
        event: String(data[i][3] || ""),
        loc: "Campus",
        icon: "calendar"
      });
    }
  } else {
    var cachedCat = scriptProperties.getProperty("CATEGORIES_DATA");
    var cachedEvt = scriptProperties.getProperty("EVENTS_DATA");
    var cachedSch = scriptProperties.getProperty("SCHEDULE_DATA");
    if (cachedCat) { try { categories = JSON.parse(cachedCat); } catch (e) {} }
    if (cachedEvt) { try { events = JSON.parse(cachedEvt); } catch (e) {} }
    if (cachedSch) { try { schedule = JSON.parse(cachedSch); } catch (e) {} }
  }

  // Support reading registrations from "Sheet1", "Registrations", or the first sheet in the spreadsheet
  var regSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Registrations") || ss.getSheets()[0];
  var registrations = [];
  if (regSheet && regSheet.getLastRow() > 1) {
    var numRows = regSheet.getLastRow() - 1;
    var numCols = Math.max(regSheet.getLastColumn(), 9);
    var regData = regSheet.getRange(2, 1, numRows, numCols).getValues();
    for (var r = 0; r < regData.length; r++) {
      var rRow = regData[r];
      if (rRow[1] || rRow[2]) {
        registrations.push({
          id: rRow[0] || (r + 1),
          name: String(rRow[1] || "").trim(),
          registerNumber: String(rRow[2] || "").trim(),
          department: String(rRow[3] || "").trim(),
          year: String(rRow[4] || "").trim(),
          event: String(rRow[5] || "Tech Talk").trim(),
          receipt: String(rRow[6] || "").trim(),
          status: String(rRow[7] || "Registered").trim(),
          timestamp: String(rRow[8] || "").trim()
        });
      }
    }
  }

  return {
    categories: Object.keys(categories).length > 0 ? categories : null,
    events: Object.keys(events).length > 0 ? events : null,
    schedule: Object.keys(schedule).length > 0 ? schedule : null,
    registrations: registrations.length > 0 ? registrations : null
  };
}

function saveSection(ss, sectionName, newDataObj) {
  var sheet = getOrCreateMgmtSheet(ss);
  var lastRow = sheet.getLastRow();

  var remainingRows = [];
  if (lastRow > 1) {
    var existing = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    for (var i = 0; i < existing.length; i++) {
      if (String(existing[i][0] || "").trim() !== sectionName) {
        remainingRows.push(existing[i]);
      }
    }
  }

  var newRows = [];
  if (sectionName === "Category") {
    for (var catKey in newDataObj) {
      if (newDataObj.hasOwnProperty(catKey)) {
        var cat = newDataObj[catKey];
        newRows.push([
          "Category",
          sanitizeCell(cat.name || catKey),
          sanitizeCell(cat.id || ""),
          sanitizeCell(cat.desc || ""),
          JSON.stringify(cat)
        ]);
      }
    }
  } else if (sectionName === "Event") {
    for (var evtKey in newDataObj) {
      if (newDataObj.hasOwnProperty(evtKey)) {
        var evt = newDataObj[evtKey];
        var summary = (evt.venue ? evt.venue + " | " : "") + (evt.time ? evt.time + " | " : "") + (evt.fee || "Free");
        newRows.push([
          "Event",
          sanitizeCell(evt.name || evtKey),
          sanitizeCell(evt.category || "General"),
          sanitizeCell(summary),
          JSON.stringify(evt)
        ]);
      }
    }
  } else if (sectionName === "Schedule") {
    for (var dateDay in newDataObj) {
      if (newDataObj.hasOwnProperty(dateDay)) {
        var items = newDataObj[dateDay];
        if (Array.isArray(items)) {
          for (var j = 0; j < items.length; j++) {
            var itm = items[j];
            newRows.push([
              "Schedule",
              sanitizeCell(itm.event || "Event"),
              sanitizeCell(dateDay),
              sanitizeCell((itm.time || "") + " @ " + (itm.loc || "")),
              JSON.stringify(itm)
            ]);
          }
        }
      }
    }
  }

  var combined = remainingRows.concat(newRows);
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 5).clearContent();
  }
  if (combined.length > 0) {
    sheet.getRange(2, 1, combined.length, 5).setValues(combined);
  }
}

function sendJsonResponse(dataObj, callback) {
  var jsonStr = JSON.stringify(dataObj);
  if (callback && callback.trim()) {
    return ContentService.createTextOutput(callback + "(" + jsonStr + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonStr)
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
