<template>
  <!-- 加载屏幕 -->
  <div v-if="!isFullyLoaded" class="loading-screen" :class="{ 'fade-out': isFadingOut }">
    <div ref="sketchContainer" class="sketch-container"></div>
    <div v-if="isLoading" class="loading-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
      </div>
      <p class="loading-text">正在加载中...</p>
    </div>
  </div>
  
  <!-- 小型动画 -->
  <div v-if="showMiniAnimation" class="mini-animation-container">
    <div ref="miniSketchContainer" class="mini-sketch-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import p5 from 'p5'

const sketchContainer = ref<HTMLDivElement>()
const miniSketchContainer = ref<HTMLDivElement>()
const isLoading = ref(true)
const progressWidth = ref(0)
const isFadingOut = ref(false)
const isFullyLoaded = ref(true)
const showMiniAnimation = ref(false)

onMounted(async () => {
  await nextTick()
  
  // 开启加载屏幕
  isFullyLoaded.value = false
  
  // 模拟加载进度
  const progressInterval = setInterval(() => {
    progressWidth.value = Math.min(progressWidth.value + Math.random() * 30, 100)
    if (progressWidth.value >= 100) {
      clearInterval(progressInterval)
      setTimeout(() => {
        isLoading.value = false
        // 延迟一点时间再开始淡出动画
        setTimeout(() => {
          startFadeOut()
        }, 500)
      }, 300)
    }
  }, 200)
  
  // 创建加载动画
  new p5((p: p5) => {
    const finalSize = 120 // 最终尺寸
    
    // 三个球体的属性
    class Body {
      angle: number
      speed: number
      radius: number
      size: number
      color: p5.Color

      constructor(angle: number, speed: number, radius: number, size: number, color: p5.Color) {
        this.angle = angle
        this.speed = speed
        this.radius = radius
        this.size = size
        this.color = color
      }

      update() {
        this.angle += this.speed
      }

      draw(centerX: number, centerY: number, scale: number = 1) {
        const x = centerX + this.radius * p.cos(this.angle) * scale
        const y = centerY + this.radius * p.sin(this.angle) * scale
        
        p.noStroke()
        p.fill(this.color)
        p.ellipse(x, y, this.size * scale)
      }
    }

    let bodies: Body[] = []

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
      canvas.parent(sketchContainer.value!)
      
      // 创建三个球体
      const bodyColor = p.color(55, 65, 81) // #374151 (charcoal)
      
      bodies = [
        new Body(0, 0.01, 80, 15, bodyColor),
        new Body(p.TWO_PI / 3, 0.015, 120, 20, bodyColor),
        new Body(p.TWO_PI * 2 / 3, 0.008, 150, 18, bodyColor)
      ]
    }

    p.draw = () => {
      // 背景使用 Tailwind 配置中的 cream 色 (浅米色)
      p.background(253, 252, 248) // #FDFCF8 (cream)
      
      const centerX = p.width / 2
      const centerY = p.height / 2
      const scale = 1
      
      // 绘制中心点
      p.noStroke()
      p.fill(55, 65, 81, 100) // 半透明 charcoal
      p.ellipse(centerX, centerY, 10 * scale)
      
      // 绘制轨道
      p.noFill()
      p.stroke(55, 65, 81, 30) // 半透明 charcoal
      p.strokeWeight(1)
      bodies.forEach(body => {
        p.ellipse(centerX, centerY, body.radius * 2 * scale)
      })
      
      // 更新和绘制球体
      bodies.forEach(body => {
        body.update()
        body.draw(centerX, centerY, scale)
      })
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight)
    }
  })
  
  // 开始淡出动画
  const startFadeOut = () => {
    isFadingOut.value = true
    // 创建小型动画
    createMiniAnimation()
    
    // 淡出动画完成后移除加载屏幕
    setTimeout(() => {
      isFullyLoaded.value = true
      showMiniAnimation.value = true
    }, 1000) // 1秒淡出时间
  }
  
  // 创建小型动画
  const createMiniAnimation = () => {
    if (!miniSketchContainer.value) return
    
    new p5((p: p5) => {
      // 三个球体的属性
      class MiniBody {
        angle: number
        speed: number
        radius: number
        size: number
        color: p5.Color

        constructor(angle: number, speed: number, radius: number, size: number, color: p5.Color) {
          this.angle = angle
          this.speed = speed
          this.radius = radius
          this.size = size
          this.color = color
        }

        update() {
          this.angle += this.speed
        }

        draw(centerX: number, centerY: number, scale: number = 1) {
          const x = centerX + this.radius * p.cos(this.angle) * scale
          const y = centerY + this.radius * p.sin(this.angle) * scale
          
          p.noStroke()
          p.fill(this.color)
          p.ellipse(x, y, this.size * scale)
        }
      }

      let bodies: MiniBody[] = []

      p.setup = () => {
        const canvas = p.createCanvas(120, 120)
        canvas.parent(miniSketchContainer.value!)
        
        // 创建三个球体
        const bodyColor = p.color(55, 65, 81) // #374151 (charcoal)
        
        bodies = [
          new MiniBody(0, 0.01, 80, 15, bodyColor),
          new MiniBody(p.TWO_PI / 3, 0.015, 120, 20, bodyColor),
          new MiniBody(p.TWO_PI * 2 / 3, 0.008, 150, 18, bodyColor)
        ]
      }

      p.draw = () => {
        // 背景使用 Tailwind 配置中的 cream 色 (浅米色)
        p.background(253, 252, 248) // #FDFCF8 (cream)
        
        const centerX = 60 // 画布中心
        const centerY = 60
        const scale = 0.15 // 与全屏时的缩放比例一致
        
        // 绘制中心点
        p.noStroke()
        p.fill(55, 65, 81, 100) // 半透明 charcoal
        p.ellipse(centerX, centerY, 10 * scale)
        
        // 更新和绘制球体
        bodies.forEach(body => {
          body.update()
          body.draw(centerX, centerY, scale)
        })
      }
    })
  }
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #FDFCF8; /* cream 色 */
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  transition: opacity 1s ease;
}

.loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.sketch-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.loading-container {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 300px;
  z-index: 10;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(55, 65, 81, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #374151;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.loading-text {
  font-family: 'Manrope', 'Outfit', sans-serif;
  font-size: 14px;
  color: #374151;
  margin: 0;
  font-weight: 500;
}

.mini-animation-container {
  position: fixed;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: all;
  z-index: 10;
  left: 180px;
  bottom: 120px;
}

.mini-sketch-container {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}
</style>