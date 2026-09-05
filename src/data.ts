export const PREDEFINED_CHURCHES = [
  { id: 'esteli', name: 'Estelí' },
  { id: 'la_empresa', name: 'La Empresa' },
  { id: 'puerto_cabezas', name: 'Puerto Cabezas' }
];

export const MONTHS = [
  "sept-26", "oct-26", "nov-26", "dic-26", "ene-27", "feb-27", 
  "mar-27", "abr-27", "may-27", "jun-27", "jul-27", "ago-27"
];

export const INITIAL_DATA_TEMPLATE = {
  iglesia: "",
  ministro: "",
  areas: [
    {
      name: "ÁREA DE EVANGELIZACIÓN",
      objective: "Incrementar la membrecía de la Iglesia Local",
      activities: [
        "REUNIONES FAMILIARES",
        "JORNADAS DE EVANGELIZACIÓN",
        "CULTOS DE VISITAS",
        "REALIZACIÓN DE BAUTISMOS EN AGUA",
        "RESTAURACIÓN DE HERMANOS RETIRADOS",
        "PRESENTACIONES CORALES",
        "REUNIÓN CON COMISIÓN DE ESTADÍSTICAS",
        "REUNIÓN CON DIRECTORES DE CORO"
      ]
    },
    {
      name: "ÁREA DE OFICIOS SAGRADOS",
      objective: "Lograr la prosperidad espiritual de la Iglesia Local",
      activities: [
        "REALIZAR AVIVAMIENTOS",
        "MATRIMONIOS",
        "PRESENTACIÓN DE NIÑOS DE 40 DÍAS",
        "BAUTISMOS"
      ]
    },
    {
      name: "ÁREA ESPIRITUAL",
      objective: "fortalecer la vida espiritual de la Iglesia Local",
      activities: [
        "ESTUDIOS DE JÓVENES",
        "ESTUDIOS DE MATRIMONIOS",
        "ESTUDIOS DE NIÑOS",
        "ESTUDIOS CON ALMAS NUEVAS",
        "ESTUDIOS HERMANOS SOLOS"
      ]
    },
    {
      name: "ÁREA PATRIMONIAL",
      objective: "Lograr el mejoramiento patrimonial de la Iglesia Local",
      activities: [
        "ADQUISICIÓN DE TERRENO",
        "LEGALIZACIÓN DE TERRENO",
        "CONSTRUCCIÓN O REMODELACIÓN DE CASA DE ORACIÓN",
        "CONSTRUCCIÓN O REMODELACIÓN DE CASA PASTORAL",
        "CONSTRUCCIÓN O REMODELACIÓN EN OBRAS",
        "MANTENIMIENTO DE CASA DE ORACIÓN",
        "MANTENIMIENTO DE CASA PASTORAL",
        "EQUIPAMIENTO DE CASA DE ORACIÓN",
        "EQUIPAMIENTO DE CASA PASTORAL",
        "REUNIÓN CON COMISIÓN DE PATRIMONIO Y PRO CONSTRUCCIÓN"
      ]
    },
    {
      name: "ÁREA FINANCIERA",
      objective: "despertar en la Iglesia la liberalidad y las buenas obras",
      activities: [
        "TEMAS DOCTRINALES QUE ABORDEN LA VIRTUD DE LA LIBERALIDAD",
        "ACTIVIDADES QUE GENEREN INGRESOS",
        "REUNIÓN CON COMISIÓN DE FINANZAS",
        "CREACIÓN DE PROYECTOS QUE GENEREN INGRESOS"
      ]
    },
    {
      name: "ÁREA SOCIAL",
      objective: "Lograr y promover el desarrollo socio económico de la Iglesia y sus alrededores",
      activities: [
        "FORMULACIÓN Y GESTIÓN DE PROYECTOS PARA IGLESIA",
        "GESTIÓN DE PROYECTOS DE LA IGLESIA EN LA COMUNIDAD",
        "REALIZACIÓN DE OBRA SOCIAL EN LA COMUNIDAD"
      ]
    },
    {
      name: "ÁREA CULTURAL",
      objective: "Promover el arte, educación, vida saludable, medio ambiente, historia de la Iglesia.",
      activities: [
        "FORMULACIÓN Y GESTIÓN DE PROYECTOS PARA IGLESIA LOCAL",
        "REALIZAR EVENTOS PARA RECORDAR HISTORIA DE LA IGLESIA",
        "CREACIÓN DE CORO DE LA IGLESIA",
        "CEREMONIA DE GRADUANDOS",
        "REUNIONES CON PROFESIONISTAS",
        "CURSOS DE CAPACITACIÓN CON INSTITUCIONES"
      ]
    }
  ]
};

export type MonthKey = typeof MONTHS[number];

export interface ActivityState {
  name: string;
  months: Record<string, number>;
  observaciones: string;
}

export interface AreaState {
  name: string;
  objective: string;
  activities: ActivityState[];
}

export interface PlanState {
  id?: string;
  churchId?: string;
  accessCode?: string;
  isLocked?: boolean;
  iglesia: string;
  ministro: string;
  areas: AreaState[];
  updatedAt: number;
}

export const createInitialState = (): PlanState => {
  return {
    iglesia: "",
    ministro: "",
    isLocked: false,
    updatedAt: Date.now(),
    areas: INITIAL_DATA_TEMPLATE.areas.map(area => ({
      name: area.name,
      objective: area.objective,
      activities: area.activities.map(act => ({
        name: act,
        months: MONTHS.reduce((acc, month) => {
          acc[month] = 0;
          return acc;
        }, {} as Record<string, number>),
        observaciones: ""
      }))
    }))
  };
};
