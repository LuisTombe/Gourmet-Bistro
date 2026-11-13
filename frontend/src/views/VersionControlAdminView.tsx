import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import {
  GitBranch,
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  GitCommit,
  Tag,
  Clock,
  User as UserIcon,
  Plus,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';

export const VersionControlAdminView: React.FC = () => {
  const {
    currentUser,
    snapshots,
    createVersionSnapshot,
    rollbackToSnapshot,
    users,
    products,
    tables,
    orders,
  } = useRestaurant();

  const [newVersionTag, setNewVersionTag] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [isConfirmingRollback, setIsConfirmingRollback] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'git_release' | 'recovery_point'>('all');

  // Solo rol Administrador puede ver o interactuar con este módulo
  if (!currentUser || currentUser.role !== 'administrador') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="mt-2 text-slate-600">
          El módulo de Versionamiento, Histórico y Rollback está reservado exclusivamente para usuarios con rol Administrador.
        </p>
      </div>
    );
  }

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    createVersionSnapshot(
      newDescription.trim(),
      newVersionTag.trim() || undefined
    );
    setNewVersionTag('');
    setNewDescription('');
  };

  const handleTriggerRollback = (id: string) => {
    setSelectedSnapshotId(id);
    setIsConfirmingRollback(true);
  };

  const executeRollback = () => {
    if (selectedSnapshotId) {
      rollbackToSnapshot(selectedSnapshotId);
      setIsConfirmingRollback(false);
      setSelectedSnapshotId(null);
    }
  };

  const filteredSnapshots = snapshots.filter((s) => {
    if (filterType === 'all') return true;
    return s.type === filterType;
  });

  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <History className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Control de Versiones & Histórico del Sistema
                </h1>
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-400">
                  Solo Admin
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Supervisión del historial del proyecto, gestión de ramas y puntos de restauración con rollback ante errores.
              </p>
            </div>
          </div>
        </div>

        {/* Resumen del entorno Git */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl shadow-sm text-xs font-semibold">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Rama activa:</span>
            <span className="font-mono text-emerald-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
              Dev
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sincronizado con origin/Dev</span>
          </div>
        </div>
      </div>

      {/* Métricas y Estado Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estado de Datos
            </span>
            <div className="mt-1 font-extrabold text-2xl text-slate-800">
              {products.length} platos
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {tables.length} mesas • {users.length} usuarios
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pedidos Registrados
            </span>
            <div className="mt-1 font-extrabold text-2xl text-slate-800">
              {orders.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">En el ciclo actual</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GitCommit className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Puntos de Restauración
            </span>
            <div className="mt-1 font-extrabold text-2xl text-slate-800">
              {snapshots.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Versiones guardadas</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Capacidad de Revert
            </span>
            <div className="mt-1 font-extrabold text-lg text-emerald-600 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Activa
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Rollback instantáneo</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Formulario para Crear Punto de Restauración / Snapshot de Versión */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">
            Crear Punto de Restauración del Sistema (Snapshot de Versión)
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-5">
          Guarda una instantánea de seguridad con el estado íntegro de la aplicación (mesas, pedidos, menú y usuarios). Si algún miembro del equipo comete un error, podrás restaurar este punto con un solo clic.
        </p>

        <form onSubmit={handleCreateSnapshot} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Etiqueta de Versión
            </label>
            <input
              type="text"
              placeholder={`v1.${snapshots.length + 1}.0-dev`}
              value={newVersionTag}
              onChange={(e) => setNewVersionTag(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-7">
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Descripción del Cambio o Hito
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Integración de módulo X antes de migración o prueba de personal"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#2554F4] hover:bg-[#1741CF] text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Guardar Snapshot
            </button>
          </div>
        </form>
      </div>

      {/* Histórico y Línea de Tiempo de Versiones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-orange-600" />
              Historial de Versiones, Commits y Puntos de Control
            </h3>
            <p className="text-xs text-slate-500">
              Auditoría cronológica de cambios registrados en el proyecto.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                filterType === 'all'
                  ? 'bg-[#2554F4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({snapshots.length})
            </button>
            <button
              onClick={() => setFilterType('recovery_point')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                filterType === 'recovery_point'
                  ? 'bg-[#2554F4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Puntos de Restauración
            </button>
            <button
              onClick={() => setFilterType('git_release')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                filterType === 'git_release'
                  ? 'bg-[#2554F4] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Git Commits
            </button>
          </div>
        </div>

        {/* Lista de Versiones */}
        <div className="divide-y divide-slate-100">
          {filteredSnapshots.map((snap) => (
            <div
              key={snap.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl text-white mt-1 ${
                    snap.type === 'recovery_point'
                      ? 'bg-emerald-600'
                      : 'bg-slate-800'
                  }`}
                >
                  {snap.type === 'recovery_point' ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <GitCommit className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {snap.versionTag}
                    </span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {snap.commitHash}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {snap.branch}
                    </span>
                    {snap.type === 'recovery_point' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Rollback Disponible
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 mt-1 font-medium">
                    {snap.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      {snap.author} ({snap.authorRole})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(snap.timestamp).toLocaleString()}
                    </span>
                    {snap.stateBackup && (
                      <span className="text-slate-500">
                        Backup: {snap.stateBackup.products.length} platos,{' '}
                        {snap.stateBackup.tables.length} mesas,{' '}
                        {snap.stateBackup.orders.length} pedidos
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Revert / Rollback */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handleTriggerRollback(snap.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    snap.stateBackup
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                  title="Revertir el sistema a este punto histórico"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Volver Atrás (Rollback)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Confirmación de Rollback */}
      {isConfirmingRollback && selectedSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              ¿Confirmar Rollback a la versión {selectedSnapshot.versionTag}?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Esta acción revertirá los datos y la configuración del restaurante al estado exacto guardado en el snapshot seleccionado:
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>
                <strong className="text-slate-800">Descripción:</strong> {selectedSnapshot.description}
              </div>
              <div>
                <strong className="text-slate-800">Fecha:</strong>{' '}
                {new Date(selectedSnapshot.timestamp).toLocaleString()}
              </div>
              <div>
                <strong className="text-slate-800">Autor:</strong> {selectedSnapshot.author}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsConfirmingRollback(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={executeRollback}
                className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <RotateCcw className="w-4 h-4" />
                Sí, Revertir Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

