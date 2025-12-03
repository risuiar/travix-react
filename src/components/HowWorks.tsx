
import { ArrowLeft, MapPin, Calendar, Euro, Activity, Receipt, Sparkles, Users, CheckCircle2, Globe, Clock, TrendingUp, Plane } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '../hooks/useAnalytics';
import { useEffect } from 'react';

const HowWorks = () => {
  const { t } = useTranslation();
  const { trackEvent, trackPageView } = useAnalytics();

  // Track page view when component mounts
  useEffect(() => {
    trackPageView('/how-works');
    trackEvent('how_works_page_viewed', {
      page: 'how-works',
    });
  }, [trackPageView, trackEvent]);
  const steps = [
    {
      title: t('howWorks.steps.step1.title'),
      description: t('howWorks.steps.step1.description'),
      icon: MapPin,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: t('howWorks.steps.step2.title'),
      description: t('howWorks.steps.step2.description'),
      icon: Calendar,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: t('howWorks.steps.step3.title'),
      description: t('howWorks.steps.step3.description'),
      icon: Globe,
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: t('howWorks.steps.step4.title'),
      description: t('howWorks.steps.step4.description'),
      icon: Activity,
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: t('howWorks.steps.step5.title'),
      description: t('howWorks.steps.step5.description'),
      icon: Receipt,
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      title: t('howWorks.steps.step6.title'),
      description: t('howWorks.steps.step6.description'),
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: t('howWorks.features.aiIntegrated.title'),
      description: t('howWorks.features.aiIntegrated.description')
    },
    {
      icon: Euro,
      title: t('howWorks.features.budgetControl.title'),
      description: t('howWorks.features.budgetControl.description')
    },
    {
      icon: Globe,
      title: t('howWorks.features.multiDestination.title'),
      description: t('howWorks.features.multiDestination.description')
    },
    {
      icon: Clock,
      title: t('howWorks.features.dailyPlanning.title'),
      description: t('howWorks.features.dailyPlanning.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Track back to app click
                trackEvent('how_works_back_to_app_clicked', {
                  page: 'how-works',
                });
                
                window.location.hash = '';
                window.location.href = '/travels';
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t('howWorks.backToApp')}</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{t('howWorks.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('howWorks.title')}</h1>
              <p className="text-xl text-gray-600">{t('howWorks.subtitle')}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('howWorks.hero.title')}</h2>
              <p className="text-lg text-white/90 max-w-3xl mx-auto">
                {t('howWorks.hero.description')}
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full"></div>
            <Plane className="absolute top-8 right-16 w-8 h-8 text-white/20 transform rotate-45" />
          </div>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('howWorks.processTitle')}</h2>
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const IconComponent = typeof step.icon === 'function' ? step.icon : null;
              const isEven = index % 2 === 0;
              return (
                <div key={step.title} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-12`}>
                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${step.gradient} text-white px-6 py-3 rounded-2xl mb-6 shadow-lg`}>
                      {IconComponent ? <IconComponent className="w-6 h-6" /> : null}
                      <span className="font-bold text-lg">{step.title || ''}</span>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {step.description || ''}
                    </p>
                  </div>
                  {/* Screenshot Placeholder */}
                  <div className="flex-1 max-w-lg">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                            {IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null}
                          </div>
                          <div className="font-semibold text-gray-700">{step.title || ''}</div>
                          <div className="text-sm text-gray-500 mt-1">{t('howWorks.interfacePreview')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('howWorks.featuresTitle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const IconComponent = typeof feature.icon === 'function' ? feature.icon : null;
              return (
                <div key={feature.title} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    {IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title || ''}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description || ''}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t('howWorks.whyChoose.title')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">📋</div>
                  <div className="text-emerald-100 font-semibold mb-2">{t('howWorks.whyChoose.stats.allInOne.title')}</div>
                  <div className="text-emerald-200 text-sm">{t('howWorks.whyChoose.stats.allInOne.description')}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">🤖</div>
                  <div className="text-emerald-100 font-semibold mb-2">{t('howWorks.whyChoose.stats.aiIdeas.title')}</div>
                  <div className="text-emerald-200 text-sm">{t('howWorks.whyChoose.stats.aiIdeas.description')}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">⚡</div>
                  <div className="text-emerald-100 font-semibold mb-2">{t('howWorks.whyChoose.stats.flexible.title')}</div>
                  <div className="text-emerald-200 text-sm">{t('howWorks.whyChoose.stats.flexible.description')}</div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Detailed Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('howWorks.detailedProcess')}</h2>
          
          <div className="space-y-12">
            {/* Step 1: Create Trip */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{t('howWorks.stepDetails.createTrip.title')}</h3>
                    <p className="text-white/80">{t('howWorks.stepDetails.createTrip.subtitle')}</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('howWorks.stepDetails.createTrip.whatCanYouDo')}</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{t('howWorks.stepDetails.createTrip.features.0')}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{t('howWorks.stepDetails.createTrip.features.1')}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{t('howWorks.stepDetails.createTrip.features.2')}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{t('howWorks.stepDetails.createTrip.features.3')}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <div className="font-semibold">{t('howWorks.stepDetails.createTrip.formTitle')}</div>
                        <div className="text-sm">{t('howWorks.stepDetails.createTrip.formSubtitle')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Daily Planner */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Paso 2: Planificador Diario</h3>
                    <p className="text-white/80">Organiza tu viaje por destinos y días</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <Calendar className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <div className="font-semibold">Vista de Planificador</div>
                        <div className="text-sm">Destinos agrupados por días</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Funcionalidades:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Crear itinerarios por ciudad específica</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Asignar fechas a cada destino</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Navegación semanal del viaje</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Vista expandible por día</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Activities */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Paso 3: Actividades y IA</h3>
                    <p className="text-white/80">Planifica cada día con sugerencias inteligentes</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Actividades:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Agregar actividades manualmente</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Sugerencias de IA personalizadas</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Timeline visual por día</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Mapa interactivo de actividades</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Prioridades y categorías</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                    <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <Activity className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                        <div className="font-semibold">Vista de Actividades</div>
                        <div className="text-sm">Timeline y mapa integrado</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Expenses */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Paso 4: Control de Gastos</h3>
                    <p className="text-white/80">Mantén tu presupuesto bajo control</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                    <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <Receipt className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
                        <div className="font-semibold">Análisis de Gastos</div>
                        <div className="text-sm">Gráficos y categorías</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Seguimiento Inteligente:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Categorización automática de gastos</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Gráficos de distribución por categoría</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Alertas de presupuesto</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Búsqueda y filtros avanzados</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Exportación a PDF (Premium)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('howWorks.finalCta.title')}</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t('howWorks.finalCta.description')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                  <div className="font-semibold">{t('howWorks.finalCta.features.aiIntegrated.title')}</div>
                  <div className="text-sm text-white/80">{t('howWorks.finalCta.features.aiIntegrated.description')}</div>
                </div>
                <div className="text-center">
                  <Euro className="w-8 h-8 mx-auto mb-2 text-green-300" />
                  <div className="font-semibold">{t('howWorks.finalCta.features.totalControl.title')}</div>
                  <div className="text-sm text-white/80">{t('howWorks.finalCta.features.totalControl.description')}</div>
                </div>
                <div className="text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                  <div className="font-semibold">{t('howWorks.finalCta.features.multiDestination.title')}</div>
                  <div className="text-sm text-white/80">{t('howWorks.finalCta.features.multiDestination.description')}</div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowWorks;