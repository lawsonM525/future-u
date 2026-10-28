'use client'

import { createAvatar } from '@dicebear/core'
import { lorelei } from '@dicebear/collection'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type BackgroundType = 'solid' | 'gradientLinear'
type ColorString = `${string}` // hex color without #

type HairVariant = 'variant01' | 'variant02' | 'variant03' | 'variant04' | 'variant05' | 'variant06' | 'variant07' | 'variant08' | 'variant09' | 'variant10' | 'variant11' | 'variant12' | 'variant13' | 'variant14' | 'variant15' | 'variant16' | 'variant17' | 'variant18' | 'variant19' | 'variant20' | 'variant21' | 'variant22' | 'variant23' | 'variant24' | 'variant25' | 'variant26' | 'variant27' | 'variant28' | 'variant29' | 'variant30' | 'variant31' | 'variant32' | 'variant33' | 'variant34' | 'variant35' | 'variant36' | 'variant37' | 'variant38' | 'variant39' | 'variant40' | 'variant41' | 'variant42' | 'variant43' | 'variant44' | 'variant45' | 'variant46' | 'variant47' | 'variant48'

type MouthVariant = 'happy01' | 'happy02' | 'happy03' | 'happy04' | 'happy05' | 'happy06' | 'happy07' | 'happy08' | 'happy09' | 'happy10' | 'happy11' | 'happy12' | 'happy13' | 'happy14' | 'happy15' | 'happy16' | 'happy17' | 'happy18' | 'sad01' | 'sad02' | 'sad03' | 'sad04' | 'sad05' | 'sad06' | 'sad07' | 'sad08' | 'sad09'

type EyesVariant = 'variant01' | 'variant02' | 'variant03' | 'variant04' | 'variant05' | 'variant06' | 'variant07' | 'variant08' | 'variant09' | 'variant10' | 'variant11' | 'variant12' | 'variant13' | 'variant14' | 'variant15' | 'variant16' | 'variant17' | 'variant18' | 'variant19' | 'variant20' | 'variant21' | 'variant22' | 'variant23' | 'variant24'

type GlassesVariant = 'variant01' | 'variant02' | 'variant03' | 'variant04' | 'variant05'
type BeardVariant = 'variant01' | 'variant02'
type EarringsVariant = 'variant01' | 'variant02' | 'variant03'
type EyebrowsVariant = 'variant01' | 'variant02' | 'variant03' | 'variant04' | 'variant05' | 'variant06' | 'variant07' | 'variant08' | 'variant09' | 'variant10' | 'variant11' | 'variant12' | 'variant13'
type FrecklesVariant = 'variant01'
type HeadVariant = 'variant01' | 'variant02' | 'variant03' | 'variant04'
type NoseVariant = 'variant01' | 'variant02' | 'variant03' | 'variant04' | 'variant05' | 'variant06'
type HairAccessoryVariant = 'flowers'

// Define the options we want to support
interface AvatarOptions {
  mouth?: MouthVariant[]
  eyes?: EyesVariant[]
  hair?: HairVariant[]
  hairColor?: ColorString[]
  skinColor?: ColorString[]
  freckles?: FrecklesVariant[]
  glasses?: GlassesVariant[]
  glassesProbability?: number
  beard?: BeardVariant[]
  beardProbability?: number
  earrings?: EarringsVariant[]
  earringsColor?: ColorString[]
  earringsProbability?: number
  eyebrows?: EyebrowsVariant[]
  eyebrowsColor?: ColorString[]
  eyesColor?: ColorString[]
  frecklesColor?: ColorString[]
  frecklesProbability?: number
  glassesColor?: ColorString[]
  hairAccessories?: HairAccessoryVariant[]
  hairAccessoriesColor?: ColorString[]
  hairAccessoriesProbability?: number
  head?: HeadVariant[]
  mouthColor?: ColorString[]
  nose?: NoseVariant[]
  noseColor?: ColorString[]
  backgroundColor?: ColorString[]
  backgroundType?: BackgroundType[]
  randomizeIds?: boolean
}

interface AvatarCreatorProps extends AvatarOptions {
  seed: string
  size?: number
  className?: string
  onRandomize?: (options: AvatarOptions) => void
  showRandomizeButton?: boolean
}

const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const getRandomColor = (): ColorString => {
  return Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') as ColorString
}

export default function AvatarCreator({ 
  seed, 
  size = 40, 
  className = '', 
  onRandomize, 
  showRandomizeButton = false,
  ...avatarOptions 
}: AvatarCreatorProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  const randomizeAvatar = () => {
    const randomOptions: AvatarOptions = {
      mouth: [getRandomElement(['happy01', 'happy02', 'happy03', 'happy04', 'happy05'] as MouthVariant[])],
      eyes: [getRandomElement(['variant01', 'variant02', 'variant03', 'variant04', 'variant05'] as EyesVariant[])],
      hair: [getRandomElement(['variant01', 'variant02', 'variant03', 'variant04', 'variant05'] as HairVariant[])],
      hairColor: [getRandomColor()],
      skinColor: [getRandomColor()],
      glassesProbability: Math.random() > 0.7 ? 100 : 0,
      glasses: ['variant01'],
      glassesColor: ['000000'],
      frecklesProbability: Math.random() > 0.7 ? 100 : 0,
      backgroundColor: ['efd200'],
      backgroundType: ['solid'],
    }
    
    // This is a preview. Only Save Changes in the editor commits preferences.
    if (onRandomize) {
      onRandomize(randomOptions)
    }
  }

  useEffect(() => {
    const generateAvatar = async () => {
      const options = {
        seed,
        size: size,
        radius: 50,
        backgroundColor: ['efd200'] as ColorString[],
        backgroundType: ['solid'] as BackgroundType[],
        randomizeIds: false,
        ...avatarOptions
      }
      
      const avatar = createAvatar(lorelei, options)
      const uri = await avatar.toDataUri()
      setAvatarUrl(uri)
    }

    generateAvatar()
  }, [seed, size, avatarOptions])

  if (!avatarUrl) {
    return <div className={`animate-pulse bg-gray-200 rounded-full ${className}`} style={{ width: size, height: size }} />
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: size, height: size }} className={className}>
        <Image 
          src={avatarUrl} 
          alt={`Avatar for ${seed}`}
          className="rounded-full"
          width={size}
          height={size}
          priority
        />
      </div>
      {showRandomizeButton && (
        <button 
          onClick={randomizeAvatar}
          className="px-4 py-2 background-color text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Randomize Avatar
        </button>
      )}
    </div>
  )
}
