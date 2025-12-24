# 🌐 Netbox - Sistema de Gestión de Redes

Sistema completo de gestión de infraestructura de red con visualización de racks, dispositivos, conexiones y topología de red.

## ✨ Características

### 🏢 Gestión de Sucursales
- Crear y administrar múltiples sucursales
- Vista de inventario por ubicación
- Contador de dispositivos por sucursal

### 🖥️ Gestión de Dispositivos
- Crear dispositivos desde plantillas o manualmente
- Soporte para múltiples tipos: switches, routers, firewalls, servidores, etc.
- Configuración de puertos y conexiones
- Direcciones IP primarias y secundarias
- Dispositivos 0U para equipos sin altura de rack

### 📊 Racks Virtuales
- Visualización de racks de 42U
- Montaje de dispositivos con altura personalizada (0U, 1U, 2U, 3U, 4U)
- **Charolas (Shelves)** para dispositivos 0U (hasta 4 dispositivos por charola)
- Patch panels para gestión de cableado
- Cable managers para organización
- Eliminación rápida con botón X (sin confirmación)

### 🔌 Gestión de Conexiones
- Conexiones físicas entre dispositivos
- Visualización de puertos conectados
- Edición de conexiones existentes
- Reporte de conexiones con IPs

### 🗺️ Mapa de Red
- Visualización interactiva de topología
- Conexiones entre dispositivos
- Filtrado automático de infraestructura

### 📋 Plantillas de Dispositivos
- Crear plantillas reutilizables
- Configuración de puertos predeterminados
- Altura de rack configurable
- Generación rápida de dispositivos

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/netbox.git
cd netbox
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Firebase

#### 3.1 Crear Proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Firestore Database**
4. Ve a **Project Settings** > **General**
5. En "Your apps", crea una **Web app**
6. Copia las credenciales de configuración

#### 3.2 Configurar Variables de Entorno
1. Copia el archivo de ejemplo:
```bash
copy .env.example .env
```

2. Edita `.env` y reemplaza con tus credenciales:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

#### 3.3 Configurar Reglas de Firestore
En Firebase Console > Firestore Database > Rules, usa:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Nota**: Estas reglas son para desarrollo. Para producción, implementa autenticación y reglas más restrictivas.

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
netbox/
├── src/
│   ├── components/          # Componentes React
│   │   ├── DeviceCard.tsx   # Tarjeta de dispositivo
│   │   ├── DeviceModal.tsx  # Modal de creación/edición
│   │   ├── NetworkMap.tsx   # Mapa de topología
│   │   ├── PatchPanelDisplay.tsx
│   │   ├── RackView.tsx     # Vista de rack virtual
│   │   └── Navbar.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useBranches.ts
│   │   ├── useDevices.ts
│   │   ├── useRacks.ts
│   │   ├── useTemplates.ts
│   │   └── useConnections.ts
│   ├── pages/               # Páginas principales
│   │   ├── BranchesPage.tsx
│   │   ├── BranchDetailPage.tsx
│   │   ├── DevicesPage.tsx
│   │   ├── ConnectionsPage.tsx
│   │   └── TemplatesPage.tsx
│   ├── types/               # Definiciones TypeScript
│   │   └── index.ts
│   ├── firebase.ts          # Configuración Firebase
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example             # Plantilla de variables
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Firebase Firestore** - Base de datos en tiempo real
- **React Router** - Navegación
- **Lucide React** - Iconos
- **CSS Variables** - Theming

## 📖 Guía de Uso

### Crear una Sucursal
1. Ve a **Sucursales**
2. Click en **Nueva Sucursal**
3. Completa nombre, ubicación y descripción
4. Click en **Crear**

### Agregar Dispositivos
1. Ve a **Dispositivos** → **Nuevo Dispositivo**
2. Completa la información:
   - Nombre, tipo, fabricante, modelo
   - IP primaria y secundaria (opcional)
   - **Altura en Rack**: 0U, 1U, 2U, 3U o 4U
3. Agrega puertos si es necesario
4. Click en **Crear Dispositivo**

### Montar Dispositivos en Rack
1. Ve a una **Sucursal** → **Racks**
2. Click en un slot vacío
3. Selecciona el dispositivo
4. El dispositivo se monta automáticamente

### Usar Charolas para Dispositivos 0U
1. Monta una **Charola para 0U (4U)** en el rack
2. Click en la charola montada
3. Selecciona un dispositivo 0U (como modems)
4. El dispositivo aparece como tarjeta azul dentro de la charola
5. Puedes agregar hasta 4 dispositivos por charola

### Eliminar Dispositivos
- Click en el **botón X rojo** en la esquina del dispositivo
- Se elimina inmediatamente sin confirmación
- Vuelve al inventario disponible

### Crear Conexiones
1. Ve a **Conexiones** → **Nueva Conexión**
2. Selecciona dispositivo origen y puerto
3. Selecciona dispositivo destino y puerto
4. Click en **Crear Conexión**

## 🔧 Configuración Avanzada

### Tipos de Dispositivos Soportados
- `switch` - Switch de red
- `router` - Router
- `firewall` - Firewall
- `server` - Servidor
- `access-point` - Punto de acceso
- `modem` - Módem
- `patch-panel` - Panel de parcheo (infraestructura)
- `shelf` - Charola para 0U (infraestructura)
- `cable-manager` - Organizador de cables (infraestructura)
- Tipos personalizados

### Alturas de Rack
- **0U**: Sin altura (modems, pequeños dispositivos)
- **1U**: Altura estándar (switches, routers)
- **2U**: Doble altura (servidores, firewalls)
- **3U**: Triple altura
- **4U**: Cuádruple altura (charolas, UPS)

## 🐛 Solución de Problemas

### Los dispositivos no aparecen
- Verifica que Firebase esté configurado correctamente
- Revisa la consola del navegador (F12) para errores
- Verifica que las reglas de Firestore permitan lectura/escritura

### No puedo agregar dispositivos 0U a charolas
- Asegúrate de que el dispositivo tenga `rackHeight: 0`
- Verifica que la charola no tenga ya 4 dispositivos
- Refresca la página (Ctrl+F5)

### Errores de Firebase
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que Firestore esté habilitado en Firebase Console
- Verifica tu conexión a internet

## 📝 Changelog

### Versión Actual
- ✅ Gestión completa de racks virtuales
- ✅ Charolas para dispositivos 0U
- ✅ Eliminación rápida sin confirmación
- ✅ Visualización de dispositivos en charolas
- ✅ Contador correcto de dispositivos (excluye infraestructura)
- ✅ Preservación de rackHeight al eliminar dispositivos 0U
- ✅ Modal de edición de conexiones
- ✅ Reporte de conexiones con IPs
- ✅ Mapa de red interactivo

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

Desarrollado con ❤️ para gestión eficiente de infraestructura de red.

## 🙏 Agradecimientos

- Firebase por la plataforma de backend
- React y Vite por las herramientas de desarrollo
- Lucide por los iconos
