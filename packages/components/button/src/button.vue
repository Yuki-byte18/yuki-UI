<template>
  <component :is="tag" :class="classes" v-bind="nativeAttrs" @click="handleClick">
    <!-- 加载中：显示转圈的loading图标 -->
    <span v-if="loading" :class="bem.e('loading')">
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="yuki-icon-spin">
        <path
          fill="currentColor"
          d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32zM195.2 195.2a32 32 0 0 1 45.248 0L376.32 331.008a32 32 0 0 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm452.544 452.544a32 32 0 0 1 45.248 0L828.8 783.552a32 32 0 0 1-45.248 45.248L647.744 692.992a32 32 0 0 1 0-45.248zM828.8 195.264a32 32 0 0 1 0 45.184L692.992 376.32a32 32 0 0 1-45.248-45.248L783.552 195.2a32 32 0 0 1 45.248 0zM240.448 647.744a32 32 0 0 1 0 45.248L195.2 828.8a32 32 0 0 1-45.248-45.248L331.008 647.68a32 32 0 0 1 45.248 0z"
        />
      </svg>
    </span>
    <!-- 图标插槽：按钮左边放图标 -->
    <span v-else-if="$slots.icon" :class="bem.e('icon')">
      <slot name="icon" />
    </span>
    <!-- 文字内容 -->
    <span v-if="$slots.default" :class="bem.e('text')">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createNamespace } from '@yuki/utils/create'
import { buttonProps } from './button'

defineOptions({
  name: 'yukiButton'
})

const bem = createNamespace('button')

const props = defineProps(buttonProps)

const emit = defineEmits(['click'])

//类名：bem基础类 + 各修饰符 + 各状态
const classes = computed(() => [
  bem.b(),
  bem.m(props.type),
  props.size ? bem.m(props.size) : '',
  bem.is('plain', props.plain),
  bem.is('round', props.round),
  bem.is('circle', props.circle),
  bem.is('link', props.link),
  bem.is('block', props.block),
  bem.is('loading', props.loading),
  bem.is('disabled', props.disabled || props.loading)
])

//只有渲染成原生 button 的时候才把 disabled/type 这些属性传下去
//否则渲染成 div/a 的时候 Vue 会警告"多余的属性"
const nativeAttrs = computed(() => {
  if (props.tag !== 'button') return {}
  return {
    disabled: props.disabled || props.loading,
    type: props.nativeType,
    autofocus: props.autofocus
  }
})

//禁用和加载中的时候不允许点击
function handleClick(evt: MouseEvent) {
  if (props.disabled || props.loading) {
    evt.stopPropagation()
    return
  }
  emit('click', evt)
}
</script>
