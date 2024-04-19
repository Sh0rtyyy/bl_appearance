import { getFrameworkID, requestLocale, sendNUIEvent, triggerServerCallback } from "@utils"
import { startCamera, stopCamera } from "./camera"
import type { TMenuTypes } from "@typings/appearance"
import { Outfit } from "@typings/outfits"
import { Send } from "@events"
import { getAppearance, getTattooData } from "./appearance/getters"
import "./handlers"

const config = exports.bl_appearance
let armour = 0


export async function openMenu(type: TMenuTypes, creation: boolean = false) {
    const ped = PlayerPedId()

    const configMenus = config.menus()

    const menu = configMenus[type]

    console.log(configMenus, menu)

    if (!menu) return

    startCamera(ped)

    const frameworkdId = getFrameworkID()

    const tabs = menu.tabs

    let allowExit = menu.allowExit

    armour = GetPedArmour(ped)

    console.log("armour", armour)

    let outfits = []

    const hasOutfitTab = tabs.includes('outfits')
    if (hasOutfitTab) {
        outfits = await triggerServerCallback<Outfit[]>('bl_appearance:server:getOutfits', frameworkdId) as Outfit[] 
    }

    let models = []

    const hasHeritageTab = tabs.includes('heritage')
    if (hasHeritageTab) {
        models = config.models()
    }

    const hasTattooTab = tabs.includes('tattoos')
    let tattoos
    if (hasTattooTab) {
        tattoos = getTattooData()
    }

    const blacklist = getBlacklist(type)

    const appearance = await getAppearance(ped)

    console.log("appearance")

    if (creation) {
        allowExit = false
    }

    sendNUIEvent( Send.data, {
        tabs,
        appearance,
        blacklist,
        tattoos,
        outfits,
        models,
        allowExit,
        locale: await requestLocale('locale')
    })
    console.log('openMenu', type)
    SetNuiFocus(true, true)
    sendNUIEvent(Send.visible, true)
}

function getBlacklist(type: TMenuTypes) {
    const blacklist = config.blacklist()

    return blacklist
}

export function closeMenu() {
    const ped = PlayerPedId()

    SetPedArmour(ped, armour)

    stopCamera()
    SetNuiFocus(false, false)
    sendNUIEvent(Send.visible, false)
}