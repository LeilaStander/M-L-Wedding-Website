// ============================================================
// FREE RSVP BACKEND — Google Apps Script
// ============================================================
// Setup: see README.md in this folder for step-by-step instructions.
//
// Assumes your Google Sheet has a tab named "Guests" with headers
// in row 1: ID | PartyID | Name | Attending | RSVPDate
// ============================================================

var SHEET_NAME = "Guests";

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var rows = data.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });

  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var result = { success: false };

  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var idCol = headers.indexOf("ID");
    var attendingCol = headers.indexOf("Attending");
    var dateCol = headers.indexOf("RSVPDate");
    var songCol = headers.indexOf("SongRequest");
    var messageCol = headers.indexOf("Message");

    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(body.id)) {
        sheet.getRange(i + 1, attendingCol + 1).setValue(body.attending);
        sheet.getRange(i + 1, dateCol + 1).setValue(body.rsvpDate);
        if (songCol !== -1 && body.songRequest) {
          sheet.getRange(i + 1, songCol + 1).setValue(body.songRequest);
        }
        if (messageCol !== -1 && body.message) {
          sheet.getRange(i + 1, messageCol + 1).setValue(body.message);
        }
        found = true;
        break;
      }
    }

    result.success = found;
    if (!found) result.error = "Guest ID not found";
  } catch (err) {
    result.error = err.message;
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
