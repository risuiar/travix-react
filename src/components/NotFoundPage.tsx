import React from "react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <svg
              version="1.0"
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 1024 1024"
              preserveAspectRatio="xMidYMid meet"
            >
              <g
                transform="translate(0,1024) scale(0.1,-0.1)"
                fill="#2563eb"
                stroke="none"
              >
                <path d="M4830 9095 c-719 -88 -1366 -401 -1879 -908 -400 -395 -641 -809 -776 -1332 -132 -511 -122 -1068 26 -1567 12 -42 25 -68 34 -68 7 0 139 -38 292 -84 153 -46 304 -92 335 -100 34 -10 62 -24 68 -36 7 -12 10 -292 10 -819 l0 -801 104 0 103 0 -1 807 c-1 704 1 809 14 824 9 10 85 36 190 64 96 26 251 69 344 96 93 27 177 49 187 49 11 0 28 -9 39 -20 20 -20 20 -33 20 -716 0 -383 3 -731 6 -774 7 -87 -2 -115 -44 -131 -15 -6 -130 -39 -256 -74 -126 -36 -231 -66 -234 -69 -8 -9 56 -113 318 -516 257 -395 404 -624 625 -970 220 -344 368 -574 438 -683 85 -131 145 -188 230 -216 164 -56 313 -27 422 84 28 27 124 162 215 300 270 408 1322 1986 1541 2310 390 579 624 931 692 1045 188 316 290 614 349 1025 22 151 16 540 -11 715 -102 667 -372 1199 -837 1650 -471 456 -1094 778 -1720 889 -219 39 -633 52 -844 26z m576 -685 c488 -39 899 -210 1213 -506 191 -180 321 -376 397 -599 l38 -110 120 -126 c214 -223 322 -443 366 -748 17 -111 8 -392 -14 -491 -123 -539 -528 -981 -1062 -1158 -185 -61 -322 -85 -499 -86 -195 -1 -236 6 -285 50 -61 55 -62 66 -58 699 l3 560 36 75 c20 41 60 104 89 140 92 113 87 76 83 636 l-3 322 -30 12 c-44 18 -105 82 -137 142 -23 45 -28 65 -28 133 0 67 5 88 27 131 56 108 156 168 278 168 125 0 214 -54 270 -166 36 -73 41 -163 13 -242 -20 -55 -90 -139 -135 -162 l-29 -15 2 -427 c1 -307 -2 -440 -11 -472 -16 -61 -51 -119 -114 -190 -97 -108 -91 -64 -91 -647 l0 -512 54 -7 c32 -4 94 -1 150 7 l96 14 0 315 c0 173 4 331 9 350 21 86 70 146 191 236 105 77 119 104 123 234 l2 105 -42 30 c-56 40 -93 96 -114 172 -40 146 23 285 158 353 111 55 235 37 328 -47 78 -70 95 -109 95 -223 0 -80 -4 -102 -23 -138 -31 -58 -101 -127 -144 -142 l-36 -13 -4 -126 c-3 -115 -6 -132 -34 -191 -39 -83 -77 -126 -177 -202 -113 -87 -111 -78 -103 -393 4 -143 9 -261 10 -262 4 -5 126 47 201 84 249 125 488 366 614 619 105 212 143 463 106 707 -38 251 -156 463 -372 667 l-91 85 -32 105 c-63 207 -150 356 -298 511 -267 281 -666 468 -1054 496 l-88 6 -2 -999 c-1 -549 -1 -1399 1 -1888 l3 -889 49 -24 c62 -31 113 -90 140 -162 52 -138 -17 -306 -155 -379 -44 -23 -63 -27 -141 -27 -74 0 -97 4 -132 22 -57 31 -108 85 -139 149 -23 47 -26 63 -22 136 2 63 9 95 28 132 25 49 111 136 135 136 10 0 12 102 8 518 l-5 517 -228 230 c-310 314 -373 384 -406 452 l-29 58 -6 690 c-3 380 -3 700 2 712 11 29 66 63 102 63 15 0 41 -7 57 -15 62 -32 60 -11 60 -722 0 -621 1 -650 20 -691 13 -29 87 -111 222 -248 l203 -205 4 1218 3 1219 -89 -8 c-605 -53 -1146 -441 -1308 -938 l-27 -85 -116 -110 c-190 -181 -285 -330 -340 -535 -22 -82 -25 -116 -26 -250 0 -127 4 -171 22 -243 53 -213 140 -351 320 -507 47 -42 52 -50 52 -88 0 -61 -48 -112 -111 -119 -43 -5 -48 -2 -114 51 -187 152 -328 380 -380 616 -26 114 -31 375 -11 494 47 275 162 492 374 706 98 98 118 124 138 178 166 435 564 803 1042 962 191 63 348 94 577 113 85 7 136 7 261 -3z m-1267 -1646 c60 -32 122 -103 142 -161 23 -66 17 -170 -14 -235 -30 -62 -90 -122 -144 -145l-35 -14 4 -122 c3 -96 8 -132 24 -167 29 -63 115 -153 255 -265 135 -110 196 -174 230 -242 23 -45 24 -60 27 -263 l3 -216 55 -28 c168 -88 210 -325 85 -468 -182 -207 -522 -96 -539 176 -6 96 23 172 89 238 27 27 59 52 71 57 l23 9 -5 190 -5 190 -30 44 c-17 24 -85 86 -150 139 -163 130 -258 233 -301 323 -43 91 -54 151 -54 297 0 66 -4 119 -9 119 -5 0 -34 22 -64 50 -73 67 -101 130 -102 230 0 93 33 169 101 229 63 55 112 71 209 68 67 -3 90 -8 134 -33z" />
                <path d="M5869 7421 c-48 -49 -38 -125 21 -156 44 -23 78 -19 111 14 62 62 20 171 -66 171 -27 0 -44 -8 -66 -29z" />
                <path d="M6563 6445 c-37 -16 -55 -45 -55 -90 0 -44 16 -72 53 -91 40 -20 82 -11 114 28 66 78 -18 194 -112 153z" />
                <path d="M5212 4185 c-74 -62 -32 -175 66 -175 41 0 80 34 88 76 18 95 -82 160 -154 99z" />
                <path d="M3951 6587 c-86 -50 -54 -187 44 -187 81 0 126 103 73 165 -28 31 -83 41 -117 22z" />
                <path d="M4491 4727 c-56 -33 -67 -108 -23 -158 66 -74 186 -12 168 87 -12 62 -92 101 -145 71z" />
              </g>
            </svg>
            <span className="font-bold text-2xl text-gray-900">Travix</span>
          </div>
        </div>

        {/* Animated Travel Icons */}
        <div className="relative mb-2">
          <div className="flex justify-center items-center space-x-8 mb-8">
            {/* Map Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
          </div>

          {/* Floating Budget Elements */}
          <div className="flex flex-col items-center gap-2 md:block">
            <div className="md:absolute md:-top-4 md:-left-8 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-float">
              €2,500 Budget
            </div>
            <div
              className="md:absolute md:-top-8 md:-right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-float"
              style={{ animationDelay: "1s" }}
            >
              AI Planning
            </div>
            <div
              className="md:absolute md:-bottom-4 md:left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-float"
              style={{ animationDelay: "2s" }}
            >
              Smart Routes
            </div>
          </div>
        </div>

        {/* 404 Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              ¡Ups! Este destino no existe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Parece que te has desviado de la ruta planificada. ¡No te
              preocupes, hasta los mejores planificadores de viaje con IA a
              veces toman desvíos inesperados!
            </p>
          </div>

          {/* Travel-themed suggestions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Volvamos al camino:
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Volver a inicio
                  </div>
                  <div className="text-sm text-gray-600">
                    Regresa a la página principal
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Explorar funciones
                  </div>
                  <div className="text-sm text-gray-600">Mira lo que viene</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/travels"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                <span>Llévame al inicio</span>
              </a>

              <a
                href="/#features"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
                <span>Explorar funciones</span>
              </a>
            </div>
          </div>

          {/* Fun travel fact */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 max-w-xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Consejo de viaje
                </div>
                <div className="text-sm text-gray-700">
                  ¿Sabías que la IA puede ayudarte a ahorrar hasta un 30% en
                  costos de viaje optimizando tu itinerario y presupuesto?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
