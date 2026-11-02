// Run server-side game rules directly, without a running Next server or database.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  })
  module._compile(outputText, filename)
}

const { namePattern } = require('../../src/lib/wtp/namePattern.ts')
const { GENERATIONS, parseSettings } = require('../../src/lib/wtp/settings.ts')
const { POKEMON } = require('../../src/lib/wtp/data.ts')
const { newRun, startRound, takeHint, guess, isOver, sealRun, openRun } = require('../../src/lib/wtp/game.ts')

assert.equal(parseSettings({ generations: [], difficulty: 'hard' }), null)
assert.equal(parseSettings({ generations: [10], difficulty: 'easy' }), null)
assert.equal(parseSettings({ generations: [1], difficulty: 'unknown' }), null)
assert.deepEqual(parseSettings({ generations: [1, 1, 9], difficulty: 'hard' }).generations, [1, 9])
assert(new Set(Array.from({ length: 50 }, () => namePattern('Bulbasaur'))).size > 1)

for (const pokemon of POKEMON) {
  for (const difficulty of ['easy', 'normal', 'hard']) {
    const pattern = namePattern(pokemon.name, difficulty)
    const letters = [...pokemon.name.toUpperCase()].filter((c) => /[A-Z]/.test(c)).length
    const visible = [...pattern].filter((c) => /[A-Z]/.test(c)).length
    assert.equal(visible, Math.floor(letters * { easy: 0.5, normal: 0.25, hard: 0 }[difficulty]))
    assert.equal(pattern.length, pokemon.name.toUpperCase().length)
    const run = newRun({ generations: [pokemon.gen], difficulty })
    run.current = { id: pokemon.id, hints: 0, namePattern: pattern }
    const revealed = new Set()
    let hint
    while ((hint = takeHint(run))) {
      assert.equal(pattern[hint.index], '_')
      assert.equal(hint.letter, pokemon.name.toUpperCase()[hint.index])
      assert(!revealed.has(hint.index))
      assert(hint.clue.length > 0)
      revealed.add(hint.index)
      const before = JSON.stringify(run)
      assert.equal(takeHint(run, hint.index), null)
      assert.equal(JSON.stringify(run), before, 'A repeated hint must not cost points')
    }
    assert.equal(revealed.size, letters - visible)
    assert.equal(guess(run, pokemon.name).correct, true)
  }
}

for (const { id } of GENERATIONS) {
  const expected = POKEMON.filter((p) => p.gen === id)
  assert(expected.length, `Generation ${id} has no playable Pokémon`)
  const run = newRun({ generations: [id], difficulty: 'hard' })
  for (let i = 0; i < expected.length; i++) {
    const pokemon = startRound(run)
    assert.equal(pokemon.gen, id)
    assert(guess(run, pokemon.name).correct)
  }
  assert.equal(new Set(run.used).size, expected.length)
  assert(isOver(run), 'A selected pool must end when its last round is answered')
  assert.equal(startRound(run), null)
}

const fullRun = newRun({ generations: GENERATIONS.map((gen) => gen.id), difficulty: 'hard' })
fullRun.used = POKEMON.map((p) => p.id)
assert.deepEqual(openRun(sealRun(fullRun)), fullRun, 'All nine generations must fit in a run token')
for (const pokemon of POKEMON) {
  assert(pokemon.assets, `Missing asset tokens for #${pokemon.id}`)
  for (const file of [
    `src/lib/wtp/data/silhouettes/${pokemon.assets.s}.webp`,
    `public/assets/wtp/r/${pokemon.assets.r}.webp`,
    ...(pokemon.hasCry ? [`public/assets/wtp/c/${pokemon.assets.c}.mp3`] : []),
  ]) {
    assert(fs.statSync(path.join(__dirname, '../..', file)).size > 0, `Missing asset: ${file}`)
  }
}
console.log(`Game checks passed for ${POKEMON.length} Pokémon across ${GENERATIONS.length} generations and 3 difficulties.`)
