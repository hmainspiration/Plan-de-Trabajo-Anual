export const PREDEFINED_CHURCHES = [
  { id: 'boaco', name: 'Boaco' },
  { id: 'buena_vista', name: 'Buena vista' },
  { id: 'chinandega', name: 'Chinandega' },
  { id: 'ciudad_lldm', name: 'Ciudad Lldm' },
  { id: 'comejen_4', name: 'Comején #4' },
  { id: 'diria', name: 'Diría' },
  { id: 'el_fortin', name: 'El Fortín' },
  { id: 'el_palenque', name: 'El Palenque' },
  { id: 'el_rama', name: 'El Rama' },
  { id: 'esteli', name: 'Estelí' },
  { id: 'fatima', name: 'Fátima' },
  { id: 'hoja_chigue', name: 'Hoja Chigue' },
  { id: 'juigalpa', name: 'Juigalpa' },
  { id: 'la_dalia', name: 'La Dalia' },
  { id: 'la_empresa', name: 'La Empresa' },
  { id: 'la_fuente', name: 'La Fuente' },
  { id: 'la_sabanita', name: 'La Sabanita' },
  { id: 'las_carolinas', name: 'Las Carolinas' },
  { id: 'leon', name: 'León' },
  { id: 'managua', name: 'Managua' },
  { id: 'masatepe', name: 'Masatepe' },
  { id: 'masaya', name: 'Masaya' },
  { id: 'matagalpa', name: 'Matagalpa' },
  { id: 'nandaime', name: 'Nandaime' },
  { id: 'nandasmo', name: 'Nandasmo' },
  { id: 'posintepe', name: 'Posintepe' },
  { id: 'posoltega', name: 'Posoltega' },
  { id: 'puerto_cabezas', name: 'Puerto Cabezas' },
  { id: 'rivas', name: 'Rivas' },
  { id: 'san_carlos', name: 'San Carlos' },
  { id: 'san_marcos', name: 'San Marcos' },
  { id: 'san_pedro', name: 'San Pedro' },
  { id: 'sebaco', name: 'Sebaco' },
  { id: 'sinai', name: 'Sinaí' },
  { id: 'siuna', name: 'Siuna' },
  { id: 'tisma', name: 'Tisma' }
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

export const sanitizePlanState = (raw: any): PlanState => {

  const initial = createInitialState();
  if (!raw || typeof raw !== 'object') return initial;

  const iglesia = typeof raw.iglesia === 'string' ? raw.iglesia : '';
  const ministro = typeof raw.ministro === 'string' ? raw.ministro : '';
  const isLocked = Boolean(raw.isLocked);
  const churchId = raw.churchId;
  const accessCode = raw.accessCode;
  const updatedAt = typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now();

  let areas: AreaState[] = [];
  if (Array.isArray(raw.areas) && raw.areas.length > 0) {
    areas = raw.areas.map((area: any, areaIdx: number) => {
      const templateArea = INITIAL_DATA_TEMPLATE.areas[areaIdx];
      const areaName = area?.name || templateArea?.name || `Área ${areaIdx + 1}`;
      const areaObjective = area?.objective || templateArea?.objective || '';

      const activities: ActivityState[] = Array.isArray(area?.activities)
        ? area.activities.map((act: any, actIdx: number) => {
            const templateActName = templateArea?.activities?.[actIdx] || `Actividad ${actIdx + 1}`;
            const actName = act?.name || templateActName;
            const months: Record<string, number> = {};
            MONTHS.forEach(m => {
              months[m] = typeof act?.months?.[m] === 'number' ? act.months[m] : 0;
            });
            const observaciones = typeof act?.observaciones === 'string' ? act.observaciones : '';
            return { name: actName, months, observaciones };
          })
        : (templateArea?.activities || []).map(actName => ({
            name: actName,
            months: MONTHS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<string, number>),
            observaciones: ''
          }));

      return {
        name: areaName,
        objective: areaObjective,
        activities
      };
    });
  } else {
    areas = initial.areas;
  }

  return {
    iglesia,
    ministro,
    isLocked,
    churchId,
    accessCode,
    updatedAt,
    areas
  };
};

