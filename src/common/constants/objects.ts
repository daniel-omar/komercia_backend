export class Objects {

  constructor() {
    throw new Error('Cannot instantiate a static class');
  }

  static EstatusEstadosOrden = {
    ACTIVO: true,
    INACTIVO: false
  };

  static EstatusMaterial = {
    ACTIVO: true,
    INACTIVO: false
  };

  static EstatusCategoriaMaterial = {
    ACTIVO: true,
    INACTIVO: false
  };

  static EstatusUsuario = {
    ACTIVO: true,
    INACTIVO: false
  };

  static ParentescoCliente = {
    PADRE: "Padre",
    HERMANO: "Hermano",
    CONYUGUE: "Conyugue",
    HIJO: "Hijo(a)",
    OTRO: "Otro"
  }

}