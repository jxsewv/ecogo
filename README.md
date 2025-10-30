# EcoGo

## Descripción
Este proyecto es una aplicación web de portafolio que sigue el patrón de diseño Modelo-Vista-Controlador (MVC). Permite a los usuarios ver una lista de proyectos y obtener detalles sobre cada uno de ellos.

## Estructura del Proyecto
El proyecto está organizado de la siguiente manera:

```
vcard-portfolio-mvc
├── src
│   ├── controllers          # Controladores de la aplicación
│   │   └── portfolioController.js
│   ├── models               # Modelos de datos
│   │   └── projectModel.js
│   ├── views                # Vistas de la aplicación
│   │   ├── layouts          # Plantillas de diseño
│   │   │   └── main.html
│   │   ├── partials         # Partes reutilizables de las vistas
│   │   │   ├── header.html
│   │   │   └── footer.html
│   │   └── pages            # Páginas específicas
│   │       ├── index.html
│   │       └── projects.html
│   ├── routes               # Definición de rutas
│   │   └── index.js
│   └── app.js               # Punto de entrada de la aplicación
├── public                   # Archivos públicos accesibles
│   ├── css
│   │   └── style.css
│   ├── js
│   │   └── main.js
│   └── images
├── package.json             # Configuración del proyecto
└── README.md                # Documentación del proyecto
```

## Instalación
1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega al directorio del proyecto:
   ```
   cd vcard-portfolio-mvc
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Uso
Para iniciar la aplicación, ejecuta el siguiente comando:
```
npm start
```
La aplicación estará disponible en `http://localhost:3000`.

## Contribuciones
Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia
Este proyecto está bajo la Licencia MIT.
