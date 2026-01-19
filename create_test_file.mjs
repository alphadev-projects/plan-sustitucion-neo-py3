import XLSX from 'xlsx';

// Sample data matching the export format
const data = [
  { Nombre: "Juan Pérez", "C.I.": "12345678", Cargo: "Gerente", Departamento: "Test Dept", "Área": "Test Area", Sede: "Test Sede" },
  { Nombre: "María García", "C.I.": "87654321", Cargo: "Analista", Departamento: "Test Dept", "Área": "Test Area", Sede: "Test Sede" },
  { Nombre: "Carlos López", "C.I.": "11111111", Cargo: "Técnico", Departamento: "Test Dept", "Área": "Test Area", Sede: "Test Sede" },
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Nómina");
XLSX.writeFile(wb, "/tmp/test_nomina.xlsx");

console.log("Test file created: /tmp/test_nomina.xlsx");
