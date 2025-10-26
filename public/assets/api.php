<?php
// public/api.php - Router principal de la API REST
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos necesarios
require_once '../config/database.php';
require_once '../app/Models/Venta.php';
require_once '../app/Models/Material.php';

// Obtener el método HTTP y la ruta
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parsear la URL para obtener el endpoint
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$endpoint = isset($uri_parts[1]) ? $uri_parts[1] : '';
$id = isset($uri_parts[2]) ? intval($uri_parts[2]) : null;

// Conectar a la base de datos
$database = new Database();
$db = $database->getConnection();

// Función para enviar respuestas JSON
function sendResponse($status_code, $data) {
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Obtener datos del body (para POST/PUT)
$data = json_decode(file_get_contents("php://input"));

// ROUTING
switch($endpoint) {
    
    // ========== VENTAS ==========
    case 'ventas':
        $venta = new Venta($db);
        
        switch($method) {
            case 'GET':
                if($id) {
                    // Obtener una venta específica
                    $venta->id = $id;
                    if($venta->obtenerPorId()) {
                        sendResponse(200, [
                            'success' => true,
                            'data' => [
                                'id' => $venta->id,
                                'nombre_cliente' => $venta->nombre_cliente,
                                'nombre_vendedor' => $venta->nombre_vendedor,
                                'fecha' => $venta->fecha,
                                'hora' => $venta->hora,
                                'fierro_kg' => $venta->fierro_kg,
                                'plastico_kg' => $venta->plastico_kg,
                                'carton_kg' => $venta->carton_kg,
                                'total' => $venta->total
                            ]
                        ]);
                    } else {
                        sendResponse(404, [
                            'success' => false,
                            'message' => 'Venta no encontrada'
                        ]);
                    }
                } else {
                    // Obtener todas las ventas
                    $stmt = $venta->obtenerTodas();
                    $ventas_arr = [];
                    
                    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        $ventas_arr[] = $row;
                    }
                    
                    sendResponse(200, [
                        'success' => true,
                        'count' => count($ventas_arr),
                        'data' => $ventas_arr
                    ]);
                }
                break;
                
            case 'POST':
                // Crear nueva venta
                if(!empty($data->nombre_cliente) && !empty($data->nombre_vendedor)) {
                    $venta->nombre_cliente = $data->nombre_cliente;
                    $venta->nombre_vendedor = $data->nombre_vendedor;
                    $venta->fierro_kg = $data->fierro_kg ?? 0;
                    $venta->plastico_kg = $data->plastico_kg ?? 0;
                    $venta->carton_kg = $data->carton_kg ?? 0;
                    
                    // Calcular total
                    $venta->total = $venta->calcularTotal($db);
                    
                    if($venta->crear()) {
                        sendResponse(201, [
                            'success' => true,
                            'message' => 'Venta registrada exitosamente',
                            'total' => $venta->total
                        ]);
                    } else {
                        sendResponse(500, [
                            'success' => false,
                            'message' => 'Error al registrar la venta'
                        ]);
                    }
                } else {
                    sendResponse(400, [
                        'success' => false,
                        'message' => 'Datos incompletos'
                    ]);
                }
                break;
                
            case 'PUT':
                // Actualizar venta
                if($id && !empty($data->nombre_cliente)) {
                    $venta->id = $id;
                    $venta->nombre_cliente = $data->nombre_cliente;
                    $venta->nombre_vendedor = $data->nombre_vendedor;
                    $venta->fierro_kg = $data->fierro_kg ?? 0;
                    $venta->plastico_kg = $data->plastico_kg ?? 0;
                    $venta->carton_kg = $data->carton_kg ?? 0;
                    
                    // Recalcular total
                    $venta->total = $venta->calcularTotal($db);
                    
                    if($venta->actualizar()) {
                        sendResponse(200, [
                            'success' => true,
                            'message' => 'Venta actualizada exitosamente'
                        ]);
                    } else {
                        sendResponse(500, [
                            'success' => false,
                            'message' => 'Error al actualizar la venta'
                        ]);
                    }
                } else {
                    sendResponse(400, [
                        'success' => false,
                        'message' => 'Datos incompletos'
                    ]);
                }
                break;
                
            case 'DELETE':
                // Eliminar venta
                if($id) {
                    $venta->id = $id;
                    if($venta->eliminar()) {
                        sendResponse(200, [
                            'success' => true,
                            'message' => 'Venta eliminada exitosamente'
                        ]);
                    } else {
                        sendResponse(500, [
                            'success' => false,
                            'message' => 'Error al eliminar la venta'
                        ]);
                    }
                } else {
                    sendResponse(400, [
                        'success' => false,
                        'message' => 'ID requerido'
                    ]);
                }
                break;
                
            default:
                sendResponse(405, [
                    'success' => false,
                    'message' => 'Método no permitido'
                ]);
        }
        break;
        
    // ========== MATERIALES/PRECIOS ==========
    case 'materiales':
        $material = new Material($db);
        
        switch($method) {
            case 'GET':
                // Obtener todos los materiales y precios
                $stmt = $material->obtenerTodos();
                $materiales_arr = [];
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $materiales_arr[] = $row;
                }
                
                sendResponse(200, [
                    'success' => true,
                    'data' => $materiales_arr
                ]);
                break;
                
            case 'PUT':
                // Actualizar precios de materiales
                if($id && isset($data->precio_compra) && isset($data->precio_venta)) {
                    $material->id = $id;
                    $material->precio_compra = $data->precio_compra;
                    $material->precio_venta = $data->precio_venta;
                    
                    if($material->actualizarPrecios()) {
                        sendResponse(200, [
                            'success' => true,
                            'message' => 'Precios actualizados exitosamente'
                        ]);
                    } else {
                        sendResponse(500, [
                            'success' => false,
                            'message' => 'Error al actualizar precios'
                        ]);
                    }
                } else {
                    sendResponse(400, [
                        'success' => false,
                        'message' => 'Datos incompletos'
                    ]);
                }
                break;
                
            default:
                sendResponse(405, [
                    'success' => false,
                    'message' => 'Método no permitido'
                ]);
        }
        break;
        
    default:
        sendResponse(404, [
            'success' => false,
            'message' => 'Endpoint no encontrado'
        ]);
}
?>