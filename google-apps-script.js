/**
 * Backend para Sistema de Ventas Go Mundo Tecno
 * 
 * Instrucciones:
 * 1. Abre tu Google Sheet.
 * 2. Ve a Extensiones -> Apps Script.
 * 3. Borra todo el código existente y pega este archivo.
 * 4. Guarda y haz clic en "Implementar" (Deploy) -> "Nueva implementación" (New deployment).
 * 5. Tipo: "Aplicación web" (Web App).
 * 6. Ejecutar como: "Tú" (Me).
 * 7. Quién tiene acceso: "Cualquiera" (Anyone).
 * 8. Haz clic en "Implementar", autoriza los permisos y copia la URL de la aplicación web.
 */

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "No se recibieron datos"
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var data = request.data;
    var result;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    inicializarHojas(ss); // Asegura que las hojas existan

    switch (action) {
      case "login":
        result = login(ss, data);
        break;
      case "getData":
        result = getAppData(ss);
        break;
      case "saveSale":
        result = saveSale(ss, data);
        break;
      case "saveRepair":
        result = saveRepair(ss, data);
        break;
      case "updateRepairStatus":
        result = updateRepairStatus(ss, data);
        break;
      case "saveProduct":
        result = saveProduct(ss, data);
        break;
      case "deleteProduct":
        result = deleteProduct(ss, data);
        break;
      case "saveUser":
        result = saveUser(ss, data);
        break;
      case "saveExpense":
        result = saveExpense(ss, data);
        break;
      case "deleteExpense":
        result = deleteExpense(ss, data);
        break;
      default:
        result = { success: false, error: "Acción no reconocida: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// También permitir GET para pruebas rápidas
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  inicializarHojas(ss);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Servicio de Go Mundo Tecno activo. Usa peticiones POST para operar.",
    sheetsAvailable: ss.getSheets().map(s => s.getName())
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

// Helper para hashear contraseñas en SHA-256
function sha256(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  var output = "";
  for (var i = 0; i < rawHash.length; i++) {
    var v = rawHash[i] & 0xff;
    if (v < 16) {
      output += "0";
    }
    output += v.toString(16);
  }
  return output;
}

// Inicializar hojas con encabezados si no existen
function inicializarHojas(ss) {
  var sheetsInfo = {
    "users": ["id", "username", "password", "name", "role", "status"],
    "products": ["id", "name", "description", "price", "stock", "category", "image"],
    "repairs": ["id", "date", "customerName", "customerPhone", "deviceModel", "issueDescription", "estimatePrice", "status", "comments", "technicianId"],
    "sales": ["id", "date", "userId", "items", "subtotal", "total", "paymentMethod", "type", "repairId"],
    "expenses": ["id", "date", "userId", "description", "amount", "paymentMethod"]
  };

  for (var sheetName in sheetsInfo) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(sheetsInfo[sheetName]);
      
      // Si creamos users por primera vez, creamos un admin por defecto (admin / admin123)
      if (sheetName === "users") {
        var adminPassHash = sha256("admin123");
        sheet.appendRow(["admin-id-1", "admin", adminPassHash, "Administrador Inicial", "admin", "activo"]);
      }
    }
  }
}

// Obtener datos de una hoja en formato array de objetos
function getSheetData(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

// Buscar fila por id en una hoja (retorna fila 1-indexed, o -1)
function findRowIndexById(sheet, id) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return -1;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) { // ID está en la primera columna
      return i + 1; // 1-indexed
    }
  }
  return -1;
}

// Autenticación de usuario
function login(ss, data) {
  var username = data.username;
  var password = data.password; // Viene en texto plano desde el frontend
  
  var sheet = ss.getSheetByName("users");
  var users = getSheetData(sheet);
  
  var passHash = sha256(password);
  
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    if (user.username.toString().toLowerCase() === username.toLowerCase()) {
      if (user.password === passHash) {
        if (user.status !== "activo") {
          return { success: false, error: "Usuario inactivo" };
        }
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
          }
        };
      } else {
        return { success: false, error: "Contraseña incorrecta" };
      }
    }
  }
  
  return { success: false, error: "Usuario no encontrado" };
}

// Obtener todos los datos necesarios para iniciar la app
function getAppData(ss) {
  return {
    success: true,
    users: getSheetData(ss.getSheetByName("users")).map(u => {
      var safeUser = {...u};
      delete safeUser.password; // No enviar passwords en la descarga general
      return safeUser;
    }),
    products: getSheetData(ss.getSheetByName("products")),
    repairs: getSheetData(ss.getSheetByName("repairs")),
    sales: getSheetData(ss.getSheetByName("sales")),
    expenses: getSheetData(ss.getSheetByName("expenses"))
  };
}

// Guardar una nueva venta y descontar inventario
function saveSale(ss, saleData) {
  var sheet = ss.getSheetByName("sales");
  var headers = headersOf(sheet);
  
  var rowData = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = saleData[key];
    if (key === "date") {
      val = new Date().toISOString();
    } else if (key === "items" && typeof val === "object") {
      val = JSON.stringify(val);
    }
    rowData.push(val || "");
  }
  sheet.appendRow(rowData);
  
  // Descontar inventario para items que no sean manuales o servicios
  var items = typeof saleData.items === "string" ? JSON.parse(saleData.items) : saleData.items;
  if (items && Array.isArray(items)) {
    var prodSheet = ss.getSheetByName("products");
    var prodHeaders = headersOf(prodSheet);
    
    for (var j = 0; j < items.length; j++) {
      var item = items[j];
      if (item.id && !item.isManual) { // Solo si es producto registrado
        var rowIdx = findRowIndexById(prodSheet, item.id);
        if (rowIdx !== -1) {
          // Obtener stock actual
          var stockColIdx = prodHeaders.indexOf("stock") + 1;
          var currentStock = prodSheet.getRange(rowIdx, stockColIdx).getValue();
          var newStock = Math.max(0, currentStock - (item.quantity || 1));
          prodSheet.getRange(rowIdx, stockColIdx).setValue(newStock);
        }
      }
    }
  }
  
  // Si es una venta de una reparación entregada, actualizar la reparación
  if (saleData.type === "reparacion" && saleData.repairId) {
    var repSheet = ss.getSheetByName("repairs");
    var repRowIdx = findRowIndexById(repSheet, saleData.repairId);
    if (repRowIdx !== -1) {
      var repHeaders = headersOf(repSheet);
      var statusCol = repHeaders.indexOf("status") + 1;
      var commCol = repHeaders.indexOf("comments") + 1;
      
      repSheet.getRange(repRowIdx, statusCol).setValue("Entregado");
      
      var currentComments = repSheet.getRange(repRowIdx, commCol).getValue() || "";
      var newComments = currentComments + (currentComments ? "\n" : "") + "[" + new Date().toISOString().substring(0, 10) + "] Reparación cobrada y entregada (Venta ID: " + saleData.id + ")";
      repSheet.getRange(repRowIdx, commCol).setValue(newComments);
    }
  }

  return { success: true };
}

// Helper para headers
function headersOf(sheet) {
  return sheet.getDataRange().getValues()[0];
}

// Guardar o actualizar una reparación
function saveRepair(ss, repairData) {
  var sheet = ss.getSheetByName("repairs");
  var headers = headersOf(sheet);
  var rowIdx = findRowIndexById(sheet, repairData.id);
  
  var rowValues = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = repairData[key];
    if (key === "date" && !val) {
      val = new Date().toISOString();
    }
    rowValues.push(val === undefined || val === null ? "" : val);
  }
  
  if (rowIdx === -1) {
    sheet.appendRow(rowValues);
  } else {
    // Reemplazar fila
    var range = sheet.getRange(rowIdx, 1, 1, headers.length);
    range.setValues([rowValues]);
  }
  
  return { success: true };
}

// Actualizar solo el estado y comentarios de una reparación
function updateRepairStatus(ss, data) {
  var sheet = ss.getSheetByName("repairs");
  var rowIdx = findRowIndexById(sheet, data.id);
  if (rowIdx === -1) {
    return { success: false, error: "Reparación no encontrada" };
  }
  
  var headers = headersOf(sheet);
  var statusCol = headers.indexOf("status") + 1;
  var commentCol = headers.indexOf("comments") + 1;
  
  sheet.getRange(rowIdx, statusCol).setValue(data.status);
  
  if (data.comment) {
    var oldVal = sheet.getRange(rowIdx, commentCol).getValue() || "";
    var newVal = oldVal + (oldVal ? "\n" : "") + "[" + new Date().toISOString().substring(0, 10) + "]: " + data.comment;
    sheet.getRange(rowIdx, commentCol).setValue(newVal);
  }
  
  return { success: true };
}

// Guardar o actualizar un producto (Inventario)
function saveProduct(ss, productData) {
  var sheet = ss.getSheetByName("products");
  var headers = headersOf(sheet);
  var rowIdx = findRowIndexById(sheet, productData.id);
  
  var rowValues = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = productData[key];
    rowValues.push(val === undefined || val === null ? "" : val);
  }
  
  if (rowIdx === -1) {
    sheet.appendRow(rowValues);
  } else {
    var range = sheet.getRange(rowIdx, 1, 1, headers.length);
    range.setValues([rowValues]);
  }
  
  return { success: true };
}

// Eliminar un producto
function deleteProduct(ss, data) {
  var sheet = ss.getSheetByName("products");
  var rowIdx = findRowIndexById(sheet, data.id);
  if (rowIdx === -1) {
    return { success: false, error: "Producto no encontrado" };
  }
  
  sheet.deleteRow(rowIdx);
  return { success: true };
}

// Guardar o actualizar un usuario (Admin)
function saveUser(ss, userData) {
  var sheet = ss.getSheetByName("users");
  var headers = headersOf(sheet);
  var rowIdx = findRowIndexById(sheet, userData.id);
  
  var rowValues = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = userData[key];
    
    // Si es password, sólo cambiarla si viene una nueva y no está vacía, hasheándola
    if (key === "password") {
      if (val) {
        val = sha256(val);
      } else if (rowIdx !== -1) {
        // Dejar el valor de password actual intacto
        val = sheet.getRange(rowIdx, i + 1).getValue();
      } else {
        // Nuevo usuario sin password? Debería ser obligatorio
        val = sha256("123456"); // Default password
      }
    }
    rowValues.push(val === undefined || val === null ? "" : val);
  }
  
  if (rowIdx === -1) {
    // Validar nombre de usuario duplicado
    var users = getSheetData(sheet);
    for (var u = 0; u < users.length; u++) {
      if (users[u].username.toString().toLowerCase() === userData.username.toString().toLowerCase()) {
        return { success: false, error: "El nombre de usuario ya existe" };
      }
    }
    sheet.appendRow(rowValues);
  } else {
    var range = sheet.getRange(rowIdx, 1, 1, headers.length);
    range.setValues([rowValues]);
  }
  
  return { success: true };
}

// Guardar o actualizar un gasto/compra
function saveExpense(ss, expenseData) {
  var sheet = ss.getSheetByName("expenses");
  var headers = headersOf(sheet);
  var rowIdx = findRowIndexById(sheet, expenseData.id);
  
  var rowValues = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = expenseData[key];
    if (key === "date" && !val) {
      val = new Date().toISOString();
    }
    rowValues.push(val === undefined || val === null ? "" : val);
  }
  
  if (rowIdx === -1) {
    sheet.appendRow(rowValues);
  } else {
    var range = sheet.getRange(rowIdx, 1, 1, headers.length);
    range.setValues([rowValues]);
  }
  
  return { success: true };
}

// Eliminar un gasto/compra
function deleteExpense(ss, data) {
  var sheet = ss.getSheetByName("expenses");
  var rowIdx = findRowIndexById(sheet, data.id);
  if (rowIdx === -1) {
    return { success: false, error: "Gasto no encontrado" };
  }
  
  sheet.deleteRow(rowIdx);
  return { success: true };
}
