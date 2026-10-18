import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface ThreeNftLoadingSceneProps {
  onReady: () => void
}

const NFT_ARTWORK = ['/images/nft-3.jpg', '/images/nft-1.jpg', '/images/nft-2.jpg']

export function ThreeNftLoadingScene({ onReady }: ThreeNftLoadingSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onReadyRef = useRef(onReady)
  const [webglAvailable, setWebglAvailable] = useState(true)
  onReadyRef.current = onReady

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Some headless browsers expose the canvas API but do not provide a GL
    // context. Detect that before Three.js creates shader helpers so the
    // supported image fallback stays quiet in automation and low-power devices.
    let context: WebGLRenderingContext | WebGL2RenderingContext | null = null
    try {
      context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    } catch {
      context = null
    }

    const shaderPrecisionIsAvailable = (() => {
      if (!context) return false
      const gl = context
      const checks: ReadonlyArray<readonly [number, number]> = [
        [gl.VERTEX_SHADER, gl.HIGH_FLOAT],
        [gl.FRAGMENT_SHADER, gl.HIGH_FLOAT],
        [gl.VERTEX_SHADER, gl.MEDIUM_FLOAT],
        [gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT],
      ]
      return checks.every(([shader, precision]) => {
        try {
          return gl.getShaderPrecisionFormat(shader, precision) !== null
        } catch {
          return false
        }
      })
    })()

    if (!context || !shaderPrecisionIsAvailable) {
      setWebglAvailable(false)
      onReadyRef.current()
      return
    }

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      setWebglAvailable(false)
      onReadyRef.current()
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0
    let lastFrame = 0
    let ready = false
    let disposed = false
    let readyFallback = 0
    let notifiedReady = false

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50)
    camera.position.set(0, 0, 8)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const frameGeometry = new THREE.BoxGeometry(2.06, 2.06, 0.12)
    const frameMaterial = new THREE.MeshBasicMaterial({ color: '#281912' })
    const imageGeometry = new THREE.PlaneGeometry(1.94, 1.94)
    const cards = NFT_ARTWORK.map((_, index) => {
      const card = new THREE.Group()
      const frame = new THREE.Mesh(frameGeometry, frameMaterial)
      const image = new THREE.Mesh(imageGeometry, new THREE.MeshBasicMaterial({ color: '#d28a4c' }))
      image.position.z = 0.067
      card.add(frame, image)

      const center = index === 1
      card.userData = {
        image,
        baseX: center ? 0 : index === 0 ? -2.05 : 2.05,
        baseY: center ? 0.2 : 0.04,
        baseZ: center ? 0.1 : -0.75,
        phase: index * 1.8,
        rotation: center ? 0 : index === 0 ? 0.22 : -0.22,
        scale: center ? 1 : 0.8,
      }
      scene.add(card)
      return card
    })

    const orbitGeometry = new THREE.TorusGeometry(2.5, 0.008, 6, 160)
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: '#d28a4c', transparent: true, opacity: 0.42 })
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
    orbit.position.set(0, 0.15, -1.55)
    orbit.rotation.set(0.72, 0.18, -0.28)
    scene.add(orbit)

    const innerOrbitGeometry = new THREE.TorusGeometry(2.12, 0.004, 6, 160)
    const innerOrbitMaterial = new THREE.MeshBasicMaterial({ color: '#f0c99d', transparent: true, opacity: 0.22 })
    const innerOrbit = new THREE.Mesh(innerOrbitGeometry, innerOrbitMaterial)
    innerOrbit.position.copy(orbit.position)
    innerOrbit.rotation.set(-0.62, -0.2, 0.5)
    scene.add(innerOrbit)

    const particlePositions = new Float32Array(96 * 3)
    for (let index = 0; index < 96; index += 1) {
      const seed = index + 1
      particlePositions[index * 3] = (Math.sin(seed * 127.1) * 0.5 + 0.5) * 8 - 4
      particlePositions[index * 3 + 1] = (Math.sin(seed * 311.7) * 0.5 + 0.5) * 5.5 - 2.75
      particlePositions[index * 3 + 2] = -2 - (Math.sin(seed * 74.7) * 0.5 + 0.5) * 4
    }
    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      color: '#e8b47d',
      size: 0.025,
      transparent: true,
      opacity: 0.52,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    const textureLoader = new THREE.TextureLoader()
    const textures = NFT_ARTWORK.map((url, index) => new Promise<void>((resolve) => {
      textureLoader.load(
        url,
        (texture) => {
          if (disposed) {
            texture.dispose()
            resolve()
            return
          }
          texture.colorSpace = THREE.SRGBColorSpace
          const image = cards[index]?.userData.image as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
          if (image) {
            image.material.map = texture
            image.material.color.set('#ffffff')
            image.material.needsUpdate = true
          } else {
            texture.dispose()
          }
          resolve()
        },
        undefined,
        () => resolve(),
      )
    }))

    const notifyReady = () => {
      if (notifiedReady || disposed) return
      notifiedReady = true
      window.clearTimeout(readyFallback)
      onReadyRef.current()
    }

    const resize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const mobile = width < 700
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      cards.forEach((card) => {
        const { baseX, baseY, baseZ, rotation, scale } = card.userData as {
          baseX: number; baseY: number; baseZ: number; rotation: number; scale: number
        }
        const centered = baseX === 0
        card.position.set(centered ? 0 : (mobile ? Math.sign(baseX) * 1.36 : baseX), mobile ? baseY + 0.15 : baseY, baseZ)
        card.rotation.set(0, rotation, centered ? -0.035 : 0)
        card.scale.setScalar(centered ? (mobile ? 0.86 : 1) : (mobile ? 0.62 : scale))
      })
    }

    const render = (time = 0) => {
      if (disposed) return
      if (!reducedMotion.matches && time - lastFrame < 1000 / 30) {
        animationFrame = window.requestAnimationFrame(render)
        return
      }
      lastFrame = time
      const seconds = time / 1000
      cards.forEach((card) => {
        const { baseY, phase, rotation } = card.userData as { baseY: number; phase: number; rotation: number }
        card.position.y = (window.innerWidth < 700 ? baseY + 0.15 : baseY) + Math.sin(seconds * 0.9 + phase) * 0.11
        card.rotation.y = rotation + Math.sin(seconds * 0.48 + phase) * 0.055
      })
      orbit.rotation.z = -0.28 + seconds * 0.055
      innerOrbit.rotation.y = -0.2 + seconds * 0.035
      particles.rotation.y = seconds * 0.012
      renderer.render(scene, camera)
      if (!ready) {
        ready = true
        Promise.allSettled(textures).then(notifyReady)
        readyFallback = window.setTimeout(() => {
          notifyReady()
        }, 850)
      }
      if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    animationFrame = window.requestAnimationFrame(render)

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(readyFallback)
      window.removeEventListener('resize', resize)
      const geometries = new Set<THREE.BufferGeometry>()
      const materialSet = new Set<THREE.Material>()
      const texturesToDispose = new Set<THREE.Texture>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          geometries.add(object.geometry)
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
          objectMaterials.forEach((material) => {
            materialSet.add(material)
          })
        }
      })
      materialSet.forEach((material) => {
        if ('map' in material && material.map instanceof THREE.Texture) texturesToDispose.add(material.map)
      })
      texturesToDispose.forEach((texture) => texture.dispose())
      materialSet.forEach((material) => material.dispose())
      geometries.forEach((geometry) => geometry.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden bg-[#140d0a]">
      {webglAvailable ? (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div className="three-loading-fallback-artwork relative h-[min(56vw,340px)] w-[min(56vw,340px)]">
            <img src={NFT_ARTWORK[0]} alt="" className="three-loading-fallback-card three-loading-fallback-card--left" />
            <img src={NFT_ARTWORK[2]} alt="" className="three-loading-fallback-card three-loading-fallback-card--right" />
            <img src={NFT_ARTWORK[1]} alt="" className="three-loading-fallback-card three-loading-fallback-card--center" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(105,59,35,0.24),transparent_48%),linear-gradient(180deg,rgba(20,13,10,0.08),rgba(20,13,10,0.74))]" />
      <div className="absolute inset-x-0 bottom-[14%] z-10 grid justify-items-center gap-3 text-center text-[#f5f1eb]" role="status" aria-live="polite">
        <span className="font-mono text-xs font-bold tracking-[0.32em]">KURIO</span>
        <p className="m-0 font-mono text-sm text-[#cfb28c]">Preparando sua próxima descoberta</p>
        <div className="three-loading-progress mt-2 h-px w-28 overflow-hidden bg-[#3f2319]" />
      </div>
    </div>
  )
}
