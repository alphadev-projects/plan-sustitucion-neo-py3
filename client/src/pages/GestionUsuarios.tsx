import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";

export default function GestionUsuarios() {
  const [isOpen, setIsOpen] = useState(false);
  const [newUser, setNewUser] = useState({ usuario: "", contraseña: "", nombre: "", email: "", role: "standard" });

  const { data: usuarios, isLoading, refetch } = trpc.auth.listarUsuarios.useQuery();
  const crearMutation = trpc.auth.crearUsuario.useMutation();
  const eliminarMutation = trpc.auth.eliminarUsuario.useMutation();

  const handleCrearUsuario = async () => {
    if (!newUser.usuario || !newUser.contraseña || !newUser.nombre) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    try {
      await crearMutation.mutateAsync({
        usuario: newUser.usuario,
        contraseña: newUser.contraseña,
        nombre: newUser.nombre,
        email: newUser.email || undefined,
        role: newUser.role as "standard" | "admin",
      });
      toast.success("Usuario creado correctamente");
      setNewUser({ usuario: "", contraseña: "", nombre: "", email: "", role: "standard" });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al crear usuario");
    }
  };

  const handleEliminarUsuario = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    try {
      await eliminarMutation.mutateAsync({ id });
      toast.success("Usuario eliminado correctamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar usuario");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra los usuarios del sistema</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Completa los datos para crear un nuevo usuario en el sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Usuario</label>
                  <Input
                    placeholder="nombre_usuario"
                    value={newUser.usuario}
                    onChange={(e) => setNewUser({ ...newUser, usuario: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contraseña</label>
                  <Input
                    type="password"
                    placeholder="Contraseña segura"
                    value={newUser.contraseña}
                    onChange={(e) => setNewUser({ ...newUser, contraseña: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <Input
                    placeholder="Juan Pérez"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email (Opcional)</label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rol</label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Estándar</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCrearUsuario}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={crearMutation.isPending}
                >
                  {crearMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Usuario"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>Lista de todos los usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios?.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.usuario}</TableCell>
                      <TableCell>{usuario.nombre}</TableCell>
                      <TableCell>{usuario.email || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            usuario.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {usuario.role === "admin" ? "Administrador" : "Estándar"}
                        </span>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEliminarUsuario(usuario.id)}
                          disabled={eliminarMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
