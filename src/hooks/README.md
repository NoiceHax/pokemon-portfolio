# hooks/ - Reusable React behavior

Custom hooks shared across features. Examples that will land as features need them:

- `useTypewriter` - dialogue typing (Milestone 4)
- `useKeyboardNav` - keyboard-accessible selection/menus (accessibility is required)
- `useSound` - play a sound through the audio manager, respecting mute
- `useReducedMotion` - honor `prefers-reduced-motion`

## Dependency direction

`hooks` may depend on `lib`, `engine`, `providers`. Keep them generic and composable.
