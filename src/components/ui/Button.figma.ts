// url=https://www.figma.com/design/SgPTn2LiKxJ4zIritbtiyj?node-id=8-50
// source=src/components/ui/Button.tsx
// component=Button
import figma from 'figma'
const instance = figma.selectedInstance

const label = instance.getString('Label')
const variant = instance.getEnum('Variant', {
  'Primary': 'primary',
  'Secondary': 'secondary',
})
const size = instance.getEnum('Size', {
  'Small': 'sm',
  'Medium': 'md',
  'Large': 'lg',
})
const disabled = instance.getBoolean('Disabled')

export default {
  example: figma.code`
    <Button
      variant="${variant}"
      size="${size}"
      ${disabled ? 'disabled' : ''}
    >
      ${label}
    </Button>
  `,
  imports: ['import { Button } from "@/src/components/ui/Button"'],
  id: 'button',
  metadata: {
    nestable: true,
  },
}
