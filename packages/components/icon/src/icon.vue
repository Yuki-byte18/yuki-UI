<template>
  <div :class="classes" :style="style">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { createNamespace } from "@yuki-byte/utils/create"
import { iconProps } from "./icon"
import { computed } from "vue"

//给组件定义名字
defineOptions({
  name: "yukiIcon",
})

const bem = createNamespace("icon")

const props = defineProps(iconProps)

//类名：基础类名 + 旋转状态类名
const classes = computed(() => [bem.b(), bem.is("spin", props.spin)])

//行内样式：只有传了 size 或者 color 才生成 避免多出没用的内联样式
const style = computed(() => {
  if (!props.size && !props.color) {
    return {}
  }
  return {
    ...(props.size ? {"font-size": props.size + "px"} : {}),
    ...(props.color ? {"color": props.color} : {}),
  }
})
</script>
