# Time Tracker & Image Tools

Una aplicación web desarrollada con Next.js y shadcn/ui que incluye herramientas para análisis de horas trabajadas y codificación/decodificación de imágenes en Base64.

## Características

### 🕒 Análisis de Horas Trabajadas
- Carga de archivos CSV con datos de tiempo
- Configuración de horarios de trabajo
- Exclusión automática de fines de semana
- Carga de días feriados desde archivo TXT
- Selección de columnas para mostrar
- Cálculo automático de horas y días totales
- Validación de horas negativas y límites máximos

### 🖼️ Codificador/Decodificador Base64
- Conversión de imágenes a código Base64
- Decodificación de Base64 a imagen
- Vista previa de imágenes
- Descarga de imágenes procesadas
- Copia de código Base64 al portapapeles

## Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <repository-url>
cd time-tracker-app
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
# o
yarn install
\`\`\`

3. Ejecuta el servidor de desarrollo:
\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso con Docker

### Construir la imagen:
\`\`\`bash
docker build -t time-tracker-app .
\`\`\`

### Ejecutar el contenedor:
\`\`\`bash
docker run -p 3000:3000 time-tracker-app
\`\`\`

## Estructura del Proyecto

\`\`\`
├── app/                    # Páginas de Next.js
├── components/            # Componentes React
│   ├── ui/               # Componentes de shadcn/ui
│   ├── app-sidebar.tsx   # Sidebar principal
│   ├── time-analysis-tool.tsx  # Herramienta de análisis
│   └── base64-encoder-tool.tsx # Herramienta Base64
├── lib/                  # Utilidades y funciones
│   ├── csv-parser.ts     # Parser de CSV
│   └── time-utils.ts     # Utilidades de tiempo
├── Dockerfile           # Configuración Docker
└── package.json        # Dependencias
\`\`\`

## Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilos
- **TypeScript** - Tipado estático
- **Papa Parse** - Parser CSV
- **date-fns** - Manejo de fechas
- **Lucide React** - Iconos

## Funcionalidades Detalladas

### Análisis de Horas
1. **Configuración**: Define horarios de trabajo y límites
2. **Carga de CSV**: Sube archivos con datos de tiempo
3. **Feriados**: Carga días feriados desde archivo TXT (formato dd/mm/yyyy)
4. **Filtros**: Selecciona qué columnas mostrar
5. **Cálculos**: Automáticos de horas y días trabajados

### Codificador Base64
1. **Codificación**: Convierte imágenes a Base64
2. **Decodificación**: Convierte Base64 a imagen
3. **Vista previa**: Muestra imágenes antes de procesar
4. **Descarga**: Guarda imágenes procesadas
5. **Portapapeles**: Copia código Base64

## Autor

© 2024 - Desarrollado por Diego Villalba.
