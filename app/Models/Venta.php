<?php
// app/Models/Venta.php
class Venta {
    private $conn;
    private $table = 'ventas';

    public $id;
    public $nombre_cliente;
    public $nombre_vendedor;
    public $fecha;
    public $hora;
    public $fierro_kg;
    public $plastico_kg;
    public $carton_kg;
    public $total;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear nueva venta
    public function crear() {
        $query = "INSERT INTO " . $this->table . "
                SET nombre_cliente = :nombre_cliente,
                    nombre_vendedor = :nombre_vendedor,
                    fierro_kg = :fierro_kg,
                    plastico_kg = :plastico_kg,
                    carton_kg = :carton_kg,
                    total = :total";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->nombre_cliente = htmlspecialchars(strip_tags($this->nombre_cliente));
        $this->nombre_vendedor = htmlspecialchars(strip_tags($this->nombre_vendedor));
        $this->fierro_kg = floatval($this->fierro_kg);
        $this->plastico_kg = floatval($this->plastico_kg);
        $this->carton_kg = floatval($this->carton_kg);
        $this->total = floatval($this->total);

        // Bind de parámetros
        $stmt->bindParam(':nombre_cliente', $this->nombre_cliente);
        $stmt->bindParam(':nombre_vendedor', $this->nombre_vendedor);
        $stmt->bindParam(':fierro_kg', $this->fierro_kg);
        $stmt->bindParam(':plastico_kg', $this->plastico_kg);
        $stmt->bindParam(':carton_kg', $this->carton_kg);
        $stmt->bindParam(':total', $this->total);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Obtener todas las ventas
    public function obtenerTodas() {
        $query = "SELECT * FROM vista_ventas_detalle ORDER BY fecha DESC, hora DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Obtener una venta por ID
    public function obtenerPorId() {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->nombre_cliente = $row['nombre_cliente'];
            $this->nombre_vendedor = $row['nombre_vendedor'];
            $this->fecha = $row['fecha'];
            $this->hora = $row['hora'];
            $this->fierro_kg = $row['fierro_kg'];
            $this->plastico_kg = $row['plastico_kg'];
            $this->carton_kg = $row['carton_kg'];
            $this->total = $row['total'];
            return true;
        }
        return false;
    }

    // Actualizar venta
    public function actualizar() {
        $query = "UPDATE " . $this->table . "
                SET nombre_cliente = :nombre_cliente,
                    nombre_vendedor = :nombre_vendedor,
                    fierro_kg = :fierro_kg,
                    plastico_kg = :plastico_kg,
                    carton_kg = :carton_kg,
                    total = :total
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nombre_cliente = htmlspecialchars(strip_tags($this->nombre_cliente));
        $this->nombre_vendedor = htmlspecialchars(strip_tags($this->nombre_vendedor));
        $this->fierro_kg = floatval($this->fierro_kg);
        $this->plastico_kg = floatval($this->plastico_kg);
        $this->carton_kg = floatval($this->carton_kg);
        $this->total = floatval($this->total);
        $this->id = intval($this->id);

        // Bind
        $stmt->bindParam(':nombre_cliente', $this->nombre_cliente);
        $stmt->bindParam(':nombre_vendedor', $this->nombre_vendedor);
        $stmt->bindParam(':fierro_kg', $this->fierro_kg);
        $stmt->bindParam(':plastico_kg', $this->plastico_kg);
        $stmt->bindParam(':carton_kg', $this->carton_kg);
        $stmt->bindParam(':total', $this->total);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Eliminar venta
    public function eliminar() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Calcular total según precios actuales
    public function calcularTotal($db) {
        $query = "SELECT 
                    SUM(
                        (CASE WHEN nombre_material = 'Fierro' THEN precio_venta * :fierro_kg ELSE 0 END) +
                        (CASE WHEN nombre_material = 'Plástico' THEN precio_venta * :plastico_kg ELSE 0 END) +
                        (CASE WHEN nombre_material = 'Cartón' THEN precio_venta * :carton_kg ELSE 0 END)
                    ) as total
                FROM precios_materiales";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':fierro_kg', $this->fierro_kg);
        $stmt->bindParam(':plastico_kg', $this->plastico_kg);
        $stmt->bindParam(':carton_kg', $this->carton_kg);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'] ?? 0;
    }
}
?>