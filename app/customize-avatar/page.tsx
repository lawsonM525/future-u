'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import AvatarCreator from '@/components/AvatarCreator'
import { lorelei } from '@dicebear/collection'
import type { JSONSchema7 } from 'json-schema'
import { toast } from 'react-hot-toast'

interface SchemaProperty {
  type: string
  enum?: string[]
  items?: {
    enum?: string[]
  }
}

interface AvatarOption {
  type: string
  choices: string[]
}

type AvatarOptions = Record<string, AvatarOption>

// List of options we want to expose to users
const ALLOWED_OPTIONS = [
  'mouth', 'eyes', 'hair', 'hairColor', 'skinColor', 
  'freckles', 'frecklesProbability', 'frecklesColor',
  'glasses', 'glassesProbability', 'glassesColor',
  'beard', 'beardProbability',
  'earrings', 'earringsProbability', 'earringsColor',
  'eyebrows', 'eyebrowsColor',
  'eyesColor',
  'hairAccessories', 'hairAccessoriesProbability', 'hairAccessoriesColor',
  'head',
  'mouthColor',
  'nose', 'noseColor'
] as const

type OptionKey = typeof ALLOWED_OPTIONS[number]

// Nice display names for options
const OPTION_LABELS: Record<OptionKey, string> = {
  mouth: 'Mouth Style',
  eyes: 'Eye Style',
  hair: 'Hair Style',
  hairColor: 'Hair Color',
  skinColor: 'Skin Tone',
  freckles: 'Freckles Style',
  frecklesProbability: 'Freckles Chance',
  frecklesColor: 'Freckles Color',
  glasses: 'Glasses Style',
  glassesProbability: 'Glasses Chance',
  glassesColor: 'Glasses Color',
  beard: 'Beard Style',
  beardProbability: 'Beard Chance',
  earrings: 'Earrings Style',
  earringsProbability: 'Earrings Chance',
  earringsColor: 'Earrings Color',
  eyebrows: 'Eyebrows Style',
  eyebrowsColor: 'Eyebrows Color',
  eyesColor: 'Eyes Color',
  hairAccessories: 'Hair Accessories',
  hairAccessoriesProbability: 'Accessories Chance',
  hairAccessoriesColor: 'Accessories Color',
  head: 'Head Shape',
  mouthColor: 'Mouth Color',
  nose: 'Nose Style',
  noseColor: 'Nose Color'
}

// Group related options together
const OPTION_GROUPS = [
  {
    title: 'Base Features',
    options: ['head', 'skinColor']
  },
  {
    title: 'Hair & Accessories',
    options: ['hair', 'hairColor', 'hairAccessories', 'hairAccessoriesProbability', 'hairAccessoriesColor']
  },
  {
    title: 'Face',
    options: ['eyes', 'eyesColor', 'eyebrows', 'eyebrowsColor', 'nose', 'noseColor', 'mouth', 'mouthColor']
  },
  {
    title: 'Accessories',
    options: ['glasses', 'glassesProbability', 'glassesColor', 'earrings', 'earringsProbability', 'earringsColor']
  },
  {
    title: 'Additional Features',
    options: ['beard', 'beardProbability', 'freckles', 'frecklesProbability', 'frecklesColor']
  }
]

export default function CustomizeAvatarPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin')
    }
  })

  const router = useRouter()
  const [options, setOptions] = useState<AvatarOptions>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | number | string[]>>({})
  const [isSaving, setIsSaving] = useState(false)
  const userEmail = session?.user?.email || ''

  useEffect(() => {
    // Get all available options from the schema
    const schemaProperties = {
      ...((lorelei.schema as JSONSchema7).properties || {})
    }

    const processedOptions: AvatarOptions = {}
    for (const [key, prop] of Object.entries(schemaProperties)) {
      // Only process allowed options
      if (ALLOWED_OPTIONS.includes(key as OptionKey) && prop && typeof prop === 'object' && !Array.isArray(prop)) {
        const property = prop as SchemaProperty
        const option: AvatarOption = {
          type: property.type === 'integer' ? 'number' : property.type,
          choices: []
        }

        // Get choices from enum or items.enum
        if (property.enum) {
          option.choices.push(...property.enum)
        } else if (property.items?.enum) {
          option.choices.push(...property.items.enum)
        }

        if (option.choices.length > 0 || property.type === 'boolean' || property.type === 'integer') {
          processedOptions[key] = option
        }
      }
    }
    setOptions(processedOptions)
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      localStorage.setItem('avatarPreferences', JSON.stringify(selectedOptions))
      toast.success('Avatar preferences saved!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOptionChange = (key: string, value: string | number | string[]) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!session?.user?.email) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Customize Your Character</h1>
            <p className="text-zinc-500">Make your avatar unique to you</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Preview Section */}
            <div className="lg:w-1/3">
              <div className="bg-zinc-900 rounded-lg p-8 sticky top-8">
                <div className="flex flex-col items-center gap-4">
                  <AvatarCreator 
                    seed={userEmail} 
                    size={200} 
                    showRandomizeButton={true}
                    {...selectedOptions} 
                  />
                  <p className="text-sm text-zinc-500">Preview</p>
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="lg:w-2/3">
              <div className="space-y-6">
                {OPTION_GROUPS.map(group => (
                  <div key={group.title} className="bg-zinc-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-yellow-400 mb-4">{group.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {group.options.map(key => {
                        const option = options[key]
                        if (!option) return null

                        if (key.endsWith('Probability')) {
                          return (
                            <div key={key} className="bg-zinc-800 p-4 rounded">
                              <label className="block text-sm font-medium text-zinc-300 mb-2">
                                {OPTION_LABELS[key as OptionKey]}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={selectedOptions[key] as number || 0}
                                  onChange={(e) => handleOptionChange(key, parseInt(e.target.value))}
                                  className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="w-8 text-sm">{selectedOptions[key] as number || 0}%</span>
                              </div>
                            </div>
                          )
                        }

                        if (key.endsWith('Color')) {
                          return (
                            <div key={key} className="bg-zinc-800 p-4 rounded">
                              <label className="block text-sm font-medium text-zinc-300 mb-2">
                                {OPTION_LABELS[key as OptionKey]}
                              </label>
                              <input
                                type="color"
                                value={`#${Array.isArray(selectedOptions[key]) ? selectedOptions[key][0] || '000000' : '000000'}`}
                                onChange={(e) => handleOptionChange(key, [e.target.value.substring(1)])}
                                className="w-full h-8 bg-zinc-700 rounded cursor-pointer"
                              />
                            </div>
                          )
                        }

                        return (
                          <div key={key} className="bg-zinc-800 p-4 rounded">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              {OPTION_LABELS[key as OptionKey]}
                            </label>
                            <select
                              value={Array.isArray(selectedOptions[key]) ? selectedOptions[key][0] || '' : ''}
                              onChange={(e) => handleOptionChange(key, [e.target.value])}
                              className="w-full bg-zinc-700 text-zinc-300 rounded px-3 py-2"
                            >
                              <option value="">Default</option>
                              {option.choices.map(choice => (
                                <option key={choice} value={choice}>
                                  {choice}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Link
                  href="/dashboard"
                  className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-6 py-2 rounded transition-colors"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`${
                    isSaving 
                      ? 'bg-yellow-400 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-black font-semibold px-6 py-2 rounded transition-colors flex items-center gap-2`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
