<template>
  <transition name="yuki-message-box-fade" @after-leave="handleAfterLeave">
    <div
      v-show="visible"
      :class="[bem.e('wrapper'), customClass]"
      :style="wrapperStyle"
      @click.self="handleWrapperClick"
    >
      <div :class="[bem.e('box'), bem.is('center', center)]" role="dialog" :style="boxStyle">
        <!-- 头部：类型图标 + 标题 + 关闭按钮 -->
        <div :class="bem.e('header')">
          <StatusIcon />
          <div :class="bem.e('title')">{{ displayTitle }}</div>
          <svg
            v-if="showClose"
            :class="bem.e('headerbtn')"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            @click="handleAction('close')"
          >
            <path
              fill="currentColor"
              d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.224 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
            />
          </svg>
        </div>

        <!-- 内容 -->
        <div :class="bem.e('content')">
          <div :class="bem.e('message')">
            <slot>
              <span v-if="dangerouslyUseHTMLString" v-html="message"></span>
              <template v-else>{{ message }}</template>
            </slot>
          </div>

          <!-- prompt 的输入框 -->
          <div v-if="inputType" :class="bem.e('input')">
            <textarea
              v-if="inputType === 'textarea'"
              ref="inputRef"
              :class="[bem.e('input-inner'), bem.is('invalid', !!validateError)]"
              :value="inputValue"
              :placeholder="inputPlaceholder"
              @input="handleInput"
              @keyup.enter="handleAction('confirm')"
            ></textarea>
            <input
              v-else
              ref="inputRef"
              :class="[bem.e('input-inner'), bem.is('invalid', !!validateError)]"
              :type="inputType"
              :value="inputValue"
              :placeholder="inputPlaceholder"
              @input="handleInput"
              @keyup.enter="handleAction('confirm')"
            />
            <div v-if="validateError" :class="bem.e('error')">{{ validateError }}</div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div :class="bem.e('btns')">
          <yuki-button
            v-if="showCancelButton"
            :type="cancelButtonType"
            :round="roundButton"
            @click="handleAction('cancel')"
          >
            {{ cancelButtonText }}
          </yuki-button>
          <yuki-button
            :type="confirmButtonType || 'primary'"
            :round="roundButton"
            :loading="loading"
            @click="handleAction('confirm')"
          >
            {{ confirmButtonText }}
          </yuki-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onUnmounted, ref, watch } from 'vue'
import { createNamespace } from '@yuki/utils/create'
import { messageBoxProps, type MessageBoxAction, type MessageBoxType } from './message-box'
//弹窗里的按钮直接用我们自己的按钮组件 不用另外写一遍样式
import YukiButton from '../../button/src/button.vue'

defineOptions({
  name: 'yukiMessageBox'
})

const bem = createNamespace('message-box')

const props = defineProps(messageBoxProps)

const emit = defineEmits(['update:modelValue', 'action', 'vanish'])

//四种类型的圆圈图标路径(和 message 组件是同一套图形)
interface IconPath {
  d: string
  evenodd?: boolean
}

const ICON_PATHS: Record<Exclude<MessageBoxType, ''>, IconPath[]> = {
  success: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z'
    }
  ],
  warning: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256zm0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4z'
    }
  ],
  error: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336L512 457.664z'
    }
  ],
  info: [
    {
      d: 'M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 64a384 384 0 1 0 0 768 384 384 0 0 0 0-768z',
      evenodd: true
    },
    {
      d: 'M544 416v256h-64V416h64zM512 288a48 48 0 1 1 0 96 48 48 0 0 1 0-96z'
    }
  ]
}

//类型图标(渲染函数组件 没传type就什么都不画)
const StatusIcon = () => {
  const type = props.type
  if (!type) return null
  const paths = ICON_PATHS[type]
  if (!paths) return null
  return h(
    'span',
    { class: [bem.e('status'), bem.em('status', props.type)] },
    [
      h(
        'svg',
        { viewBox: '0 0 1024 1024', xmlns: 'http://www.w3.org/2000/svg' },
        paths.map(path =>
          h('path', {
            d: path.d,
            fill: 'currentColor',
            'fill-rule': path.evenodd ? 'evenodd' : undefined
          })
        )
      )
    ]
  )
}

//=====================================================================
//状态
//=====================================================================
//真正的显示状态：既支持 v-model 外部控制 也支持组件内部自己开/关
const visible = ref(props.modelValue)
//确定按钮的loading(校验是异步的时候会有用)
const loading = ref(false)
//输入框的值
const inputValue = ref(props.inputValue)
//校验错误提示
const validateError = ref('')
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()

const displayTitle = computed(() => props.title || '提示')

const wrapperStyle = computed(() => (props.zIndex ? { zIndex: props.zIndex } : undefined))

const boxStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width
}))

//外面改了 v-model 跟着变
watch(
  () => props.modelValue,
  val => (visible.value = val)
)

//里面改了显示状态 通知外面(实现 v-model 双向)
watch(visible, val => {
  if (val !== props.modelValue) emit('update:modelValue', val)

  if (val) {
    //打开的时候：监听 esc 让输入框自动聚焦
    document.addEventListener('keydown', handleKeydown)
    nextTick(() => inputRef.value?.focus())
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

//=====================================================================
//交互
//=====================================================================
function handleKeydown(evt: KeyboardEvent) {
  if (evt.key === 'Escape' && props.closeOnPressEscape) {
    evt.preventDefault()
    handleAction('close')
  }
}

function handleInput(evt: Event) {
  inputValue.value = (evt.target as HTMLInputElement).value
  //用户重新输入了 先把错误提示清掉
  validateError.value = ''
}

//点遮罩关闭(用 @click.self 保证只有点到遮罩本身才关 点弹窗内部不会关)
function handleWrapperClick() {
  if (props.closeOnClickModal) handleAction('close')
}

//校验输入内容(prompt 专用)
async function validateInput(): Promise<boolean> {
  const value = inputValue.value

  if (props.inputPattern && !props.inputPattern.test(value)) {
    validateError.value = props.inputErrorMessage
    return false
  }

  if (props.inputValidator) {
    try {
      const result = await props.inputValidator(value)
      if (result === false) {
        validateError.value = props.inputErrorMessage
        return false
      }
      //返回字符串时 字符串本身就是错误提示
      if (typeof result === 'string') {
        validateError.value = result
        return false
      }
    } catch (err) {
      validateError.value = err instanceof Error ? err.message : String(err)
      return false
    }
  }

  validateError.value = ''
  return true
}

async function handleAction(action: MessageBoxAction) {
  if (loading.value) return

  //确定的时候 如果是输入弹窗 先校验
  if (action === 'confirm' && props.inputType) {
    loading.value = true
    const pass = await validateInput()
    loading.value = false
    if (!pass) return
  }

  emit('action', action)
  close()
}

function close() {
  visible.value = false
}

//过渡动画播完了 通知外面可以卸载了
function handleAfterLeave() {
  emit('vanish')
}

//=====================================================================
//暴露给函数式调用(method.ts)用的方法
//=====================================================================
defineExpose({
  //打开
  open: () => {
    visible.value = true
  },
  close,
  //拿到输入框的值
  getInputValue: () => inputValue.value
})
</script>
