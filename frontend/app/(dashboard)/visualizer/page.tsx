'use client';

import { useEffect, useState } from 'react';
import { Phone3DVisualizer } from '../../components';
import { useMobileSensors } from '../../hooks';
import { Button, Alert } from '../../components';

export default function Visualizer3DPage() {
  const {
    orientation,
    motion,
    acceleration,
    isSupported,
    hasPermission,
    isListening,
    requestPermission,
    startListening,
    stopListening,
  } = useMobileSensors();

  const [permissionRequested, setPermissionRequested] = useState(false);
  const [showRealtime, setShowRealtime] = useState(false);

  // Request permission on mount if iOS
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !hasPermission && !permissionRequested) {
      // Don't auto-request on iOS to avoid annoying users
      // They will click the button manually
    }
  }, [hasPermission, permissionRequested]);

  const handleRequestPermission = async () => {
    setPermissionRequested(true);
    const granted = await requestPermission();
    if (granted) {
      startListening();
      setShowRealtime(true);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      setShowRealtime(false);
    } else {
      startListening();
      setShowRealtime(true);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Visualiseur 3D</h1>
          <p className="text-gray-600">
            Visualisez votre appareil en 3D avec les capteurs en temps réel
          </p>
        </div>

        {/* Info */}
        {!isSupported && (
          <Alert
            type="error"
          >
            <strong>Capteurs non supportés:</strong> Votre navigateur ne supporte pas les capteurs d'appareil. Utilisez un navigateur moderne comme Chrome, Safari ou Firefox.
          </Alert>
        )}

        {isSupported && !hasPermission && (
          <Alert
            type="warning"
          >
            <strong>Permission requise:</strong> {
              isIOS
                ? "Pour accéder aux capteurs sur iOS, appuyez sur le bouton 'Autoriser les capteurs' ci-dessous."
                : "Vous devez autoriser l'accès aux capteurs pour utiliser cette fonction."
            }
          </Alert>
        )}

        {isSupported && hasPermission && (
          <Alert
            type="success"
          >
            <strong>Capteurs activés:</strong> Les capteurs de votre appareil sont actifs. Bougez votre appareil pour voir le visualiseur 3D en action.
          </Alert>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Contrôles</h2>

          <div className="flex flex-wrap gap-3">
            {!hasPermission ? (
              <Button
                onClick={handleRequestPermission}
                disabled={permissionRequested && !hasPermission}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {permissionRequested ? 'Permission demandée...' : 'Autoriser les capteurs'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleToggleListening}
                  className={isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  {isListening ? 'Arrêter' : 'Démarrer'} les capteurs
                </Button>

                {isListening && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    En direct
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-sm text-gray-600">
            {isIOS
              ? 'iOS: Les capteurs nécessitent une permission explicite.'
              : isAndroid
                ? 'Android: Les capteurs devraient fonctionner directement.'
                : 'Bureau: Les capteurs ne sont généralement pas disponibles sur les ordinateurs.'}
          </p>
        </div>

        {/* 3D Visualizer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Phone3DVisualizer
            autoRotate={!showRealtime}
            showAxes={true}
            showInfo={true}
          />
        </div>

        {/* Sensor Data Display */}
        {showRealtime && (orientation || motion || acceleration) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Orientation */}
            {orientation && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Orientation</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Alpha (Z)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {orientation.alpha.toFixed(1)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Beta (X)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {orientation.beta.toFixed(1)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gamma (Y)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {orientation.gamma.toFixed(1)}°
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Motion (Gyroscope) */}
            {motion && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gyroscope</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">X (rad/s)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {motion.x.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Y (rad/s)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {motion.y.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Z (rad/s)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {motion.z.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Acceleration */}
            {acceleration && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accélération</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">X (m/s²)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {acceleration.x.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Y (m/s²)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {acceleration.y.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Z (m/s²)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {acceleration.z.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Comment ça marche?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              ✓ <strong>Orientation:</strong> Alpha (rotation Z), Beta (rotation X), Gamma (rotation Y)
            </li>
            <li>
              ✓ <strong>Gyroscope:</strong> Mesure la vitesse de rotation en radians par seconde
            </li>
            <li>
              ✓ <strong>Accélération:</strong> Mesure l'accélération en mètres par seconde au carré
            </li>
            <li>
              ✓ <strong>3D:</strong> Le modèle 3D du téléphone se met à jour en temps réel
            </li>
            <li>
              ✓ <strong>Axes:</strong> Rouge=X, Vert=Y, Bleu=Z
            </li>
          </ul>
        </div>

        {/* Requirements */}
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">📱 Exigences</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>✓ Utiliser un vrai appareil mobile (pas un émulateur)</li>
            <li>✓ Le site doit être en HTTPS (les capteurs nécessitent HTTPS)</li>
            <li>✓ Autoriser l'accès aux capteurs quand demandé</li>
            <li>✓ Navigateur moderne: Chrome, Safari, Firefox, Edge</li>
            <li>✓ Sur iOS 13+, permission explicite requise</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
