<template>
  <span :class="classes" :style="style" @click="handleClick">
    <span :class="bem.e('content')">
      <slot />
    </span>
    <svg
      v-if="closable"
      :class="bem.e('close')"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      @click.stop="handleClose"
    >
      <path
        fill="currentColor"
        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.224 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
      />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createNamespace } from '@yuki/utils/create'
import { tagProps } from './tag'

defineOptions({
  name: 'yukiTag'
})

const bem = createNamespace('tag')

const props = defineProps(tagProps)

const emit = defineEmits(['click', 'close'])

const classes = computed(() => [
  bem.b(),
  bem.m(props.type),
  props.size ? bem.m(props.size) : '',
  //effect 是"风格" 用状态类名表示 is-light / is-dark / is-plain
  bem.is('light', props.effect === 'light'),
  bem.is('dark', props.effect === 'dark'),
  bem.is('plain', props.effect === 'plain'),
  bem.is('closable', props.closable),
  bem.is('round', props.round),
  bem.is('disable-transitions', props.disableTransitions)
])

const style = computed(() => (props.disableTransitions ? { transition: 'none' } : {}))

function handleClick(evt: MouseEvent) {
  emit('click', evt)
}

function handleClose(evt: MouseEvent) {
  evt.stopPropagation()
  emit('close', evt)
}
</script>
