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

  static TiposDescuento = {
    NONE: {
      id: 0, name: 'none'
    },
    PERCENT: {
      id: 1, name: 'percent'
    },
    FIXED: {
      id: 2, name: 'fixed'
    }
  }

  static Pefiles = {
    VENDEDOR: {
      id: 1, name: 'vendedor'
    },
    SUPERVISOR: {
      id: 2, name: 'supervisor'
    },
    ADMINISTRADOR: {
      id: 3, name: 'administrador'
    }
  }

  static Meses = [
    {
      name: "Enero",
      shortName: "Ene"
    },
    {
      name: "Febrero",
      shortName: "Feb"
    },
    {
      name: "Marzo",
      shortName: "Mar"
    },
    {
      name: "Abril",
      shortName: "Abr"
    },
    {
      name: "Mayo",
      shortName: "May"
    },
    {
      name: "Junio",
      shortName: "Jun"
    },
    {
      name: "Julio",
      shortName: "Jul"
    },
    {
      name: "Agosto",
      shortName: "Agos"
    },
    {
      name: "Setiembre",
      shortName: "Set"
    },
    {
      name: "Octubre",
      shortName: "Oct"
    },
    {
      name: "Noviembre",
      shortName: "Nov"
    },
    {
      name: "Diciembre",
      shortName: "Dic"
    }
  ]

}