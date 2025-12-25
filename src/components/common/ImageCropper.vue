<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-vue-next'

const props = defineProps<{
  image: string
  aspectRatio?: number
  title?: string
}>()

const emit = defineEmits<{
  confirm: [blob: Blob]
  cancel: []
}>()

const cropperRef = ref<InstanceType<typeof VueCropper> | null>(null)
const isProcessing = ref(false)

const cropperOptions = computed(() => ({
  img: props.image,
  outputSize: 1,
  outputType: 'png',
  info: true,
  canScale: true,
  autoCrop: true,
  autoCropWidth: props.aspectRatio && props.aspectRatio > 1 ? 400 : 200,
  autoCropHeight: props.aspectRatio && props.aspectRatio > 1 ? 400 / props.aspectRatio : 200,
  fixed: !!props.aspectRatio,
  fixedNumber: props.aspectRatio ? [props.aspectRatio, 1] : [1, 1],
  full: false,
  fixedBox: false,
  canMove: true,
  canMoveBox: true,
  original: false,
  centerBox: true,
  high: true,
  infoTrue: true,
  maxImgSize: 2000,
  mode: 'contain'
}))

function rotateLeft() {
  cropperRef.value?.rotateLeft()
}

function rotateRight() {
  cropperRef.value?.rotateRight()
}

function zoomIn() {
  cropperRef.value?.changeScale(1)
}

function zoomOut() {
  cropperRef.value?.changeScale(-1)
}

function reset() {
  cropperRef.value?.refresh()
}

async function handleConfirm() {
  if (!cropperRef.value || isProcessing.value) return
  isProcessing.value = true
  
  cropperRef.value.getCropBlob((blob: Blob) => {
    emit('confirm', blob)
    isProcessing.value = false
  })
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="cropper-modal">
    <div class="cropper-container" @click.stop>
      <!-- 头部 -->
      <div class="cropper-header">
        <h3 class="text-lg font-sans font-semibold text-charcoal">
          {{ title || '裁剪图片' }}
        </h3>
        <button @click="handleCancel" class="close-btn">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 裁剪区域 -->
      <div class="cropper-body">
        <VueCropper
          ref="cropperRef"
          v-bind="cropperOptions"
        />
      </div>

      <!-- 工具栏 -->
      <div class="cropper-toolbar">
        <button @click="rotateLeft" class="tool-btn" title="向左旋转">
          <RotateCcw class="w-4 h-4" />
        </button>
        <button @click="rotateRight" class="tool-btn" title="向右旋转">
          <RotateCw class="w-4 h-4" />
        </button>
        <div class="toolbar-divider"></div>
        <button @click="zoomOut" class="tool-btn" title="缩小">
          <ZoomOut class="w-4 h-4" />
        </button>
        <button @click="zoomIn" class="tool-btn" title="放大">
          <ZoomIn class="w-4 h-4" />
        </button>
        <div class="toolbar-divider"></div>
        <button @click="reset" class="tool-btn" title="重置">
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>

      <!-- 底部按钮 -->
      <div class="cropper-footer">
        <button @click="handleCancel" class="cancel-btn">
          取消
        </button>
        <button 
          @click="handleConfirm" 
          :disabled="isProcessing"
          class="confirm-btn"
        >
          <Check v-if="!isProcessing" class="w-4 h-4" />
          <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>{{ isProcessing ? '处理中...' : '确认裁剪' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cropper-modal {
  @apply fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50;
  @apply flex items-center justify-center p-4;
}

.cropper-container {
  @apply bg-white rounded-morandi shadow-2xl w-full max-w-2xl;
  @apply flex flex-col overflow-hidden;
}

.cropper-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-slate/10;
}

.close-btn {
  @apply p-2 rounded-lg text-slate hover:bg-slate/10 transition-colors;
}

.cropper-body {
  @apply relative bg-slate/5;
  height: 400px;
}

.cropper-toolbar {
  @apply flex items-center justify-center gap-2 px-6 py-3 bg-slate/5 border-t border-slate/10;
}

.tool-btn {
  @apply p-2 rounded-lg text-slate hover:bg-white hover:text-charcoal hover:shadow-sm transition-all;
}

.toolbar-divider {
  @apply w-px h-6 bg-slate/20 mx-2;
}

.cropper-footer {
  @apply flex items-center justify-end gap-3 px-6 py-4 border-t border-slate/10;
}

.cancel-btn {
  @apply px-5 py-2.5 rounded-soft text-sm font-sans font-medium;
  @apply text-slate hover:bg-slate/10 transition-colors;
}

.confirm-btn {
  @apply px-5 py-2.5 rounded-soft text-sm font-sans font-medium;
  @apply bg-morandi-lavender text-white hover:bg-morandi-lavender/90;
  @apply flex items-center gap-2 transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
