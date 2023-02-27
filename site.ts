const DEBUG_SKIP_LAST_SEEN = false
const DEBUG_SKIP_FEATURE_FLAG = false

if (DEBUG_SKIP_LAST_SEEN || DEBUG_SKIP_FEATURE_FLAG) {
    console.warn('User interview app running in Debug mode')
}

type Config = {
    domains: string
    invitationTitle: string
    invitationBody: string
    bookButtonText: string
    closeButtonText: string
    footerHTML: string
    shownUserInterviewPopupEvent: string
    dismissUserInterviewPopupEvent: string
    clickBookButtonEvent: string
    userPropertyNameSeenUserInterview: string
    minDaysSinceLastSeenPopUp: string
    flagStartsWith: string
}

const style = /* css */ `
        .popup,
        .button,
        .thanks {
            position: fixed;
            bottom: 20px;
            right: 20px;
            color: black;
            font-weight: normal;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif,
                'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            text-align: left;
            z-index: 999999;
        }
        .button {
            width: 64px;
            height: 64px;
            border-radius: 100%;
            text-align: center;
            line-height: 60px;
            font-size: 32px;
            border: none;
            cursor: pointer;
        }
        .button:hover {
            filter: brightness(1.2);
        }
        .thanks {
            background: white;
        }
        .popup {
            display: none;
            flex-direction: column;
            background: white;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            padding-top: 5px;
            max-width: 380px;
            box-shadow: -6px 0 16px -8px rgb(0 0 0 / 8%), -9px 0 28px 0 rgb(0 0 0 / 5%),
                -12px 0 48px 16px rgb(0 0 0 / 3%);
        }
        .popup .userinterview-invitation {
            color: #2d2d2d;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif,
                'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            margin-bottom: 10px;
            background: white;
            color: black;
            border: none;
            outline: none;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 10px;
        }
        .popup-book-button {
            box-sizing: border-box;
            margin: 0;
            font-family: inherit;
            overflow: visible;
            text-transform: none;
            line-height: 1.5715;
            position: relative;
            display: inline-block;
            font-weight: 400;
            white-space: nowrap;
            text-align: center;
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            user-select: none;
            touch-action: manipulation;
            height: 32px;
            padding: 4px 15px;
            font-size: 14px;
            border-radius: 4px;
            outline: 0;
            color: #fff;
            border-color: #1d4aff;
            background: #1d4aff;
            text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
        }
        .popup-book-button:hover {
            filter: brightness(1.2);
        }
        .popup-close-button {
            box-sizing: border-box;
            margin: 0;
            font-family: inherit;
            overflow: visible;
            text-transform: none;
            line-height: 1.5715;
            position: relative;
            display: inline-block;
            font-weight: 400;
            white-space: nowrap;
            text-align: center;
            border: 1px solid transparent;
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            user-select: none;
            touch-action: manipulation;
            height: 32px;
            padding: 4px 15px;
            font-size: 14px;
            border-radius: 4px;
            color: #2d2d2d;
            border-color: rgba(0, 0, 0, 0.15);
            background: #fff;
            outline: 0;
        }
        .bolded {
            font-weight: 600;
        }
        .bottom-section {
            border-top: 1px solid #f0f0f0;
            padding: 10px 0px;
            height: 20px;
        }
        .buttons {
            display: flex;
            justify-content: space-between;
        }
        .invitation-title {
            font-family: -apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif,
                'Apple Color Emoji', 'Segoe UI Emoji', Segoe UI Symbol;
            color: #2d2d2d;
            font-size: 1.125rem;
            font-weight: 700;
            text-align: left;
            margin-top: 0;
        }
        /* popup-body with padding */
        .invitation-body {
            font-family: -apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif,
                'Apple Color Emoji', 'Segoe UI Emoji', Segoe UI Symbol;
            color: #2d2d2d;
            font-size: 0.875rem;
            font-weight: 400;
            text-align: left;
        }
`

function createShadowDOM(style: string): ShadowRoot {
    const div = document.createElement('div')
    const shadow = div.attachShadow({ mode: 'open' })
    if (style) {
        const styleElement = Object.assign(document.createElement('style'), {
            innerText: style,
        })
        shadow.appendChild(styleElement)
    }
    document.body.appendChild(div)
    return shadow
}

function getFeatureSessionStorageKey(featureFlagName: string): string {
    return `ph-${featureFlagName}`
}

function dateDiffFromToday(date: string): number {
    const today = new Date()
    const diff = Math.abs(today.getTime() - new Date(date).getTime())
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
    return diffDays
}

function createPopUp(
    posthog: any,
    config: Config,
    shadow: ShadowRoot,
    bookButtonURL: string,
    featureFlagName: string,
    flagInvitationTitle: string,
    flagInvitationBody: string,
    flagCloseButtonText: string,
    flagBookButtonText: string
) {
    if (!bookButtonURL) {
        console.error('No book button URL provided')
        return
    }

    const invitationTitle = flagInvitationTitle || config.invitationTitle
    const invitationBody = flagInvitationBody || config.invitationBody
    const closeButtonText = flagCloseButtonText || config.closeButtonText
    const bookButtonText = flagBookButtonText || config.bookButtonText

    posthog.capture(config.shownUserInterviewPopupEvent, {
        featureFlagName: featureFlagName,
    })

    const popupHTML = /*html*/ `
    <div class="popup" style="display: flex">
        <div class="userinterview-invitation">
            <h2 class="invitation-title">${invitationTitle}</h2>
            <div class="invitation-body">${invitationBody}</p>
        </div>
        <div class="bottom-section">
            <div class="buttons">
                <button class="popup-close-button" type="button">
                    ${closeButtonText}
                </button>
                <button class="popup-book-button" onclick="window.open('${bookButtonURL}')">
                    ${bookButtonText}
                </button>
            </div>
        </div>
    </div>`
    const popup = Object.assign(document.createElement('div'), {
        innerHTML: popupHTML,
    })
    shadow.appendChild(popup)

    const sessionStorageName = getFeatureSessionStorageKey(featureFlagName)

    shadow.addEventListener('click', (e: MouseEvent) => {
        let event
        const targetElement = e.target as Element
        if (targetElement.classList.contains('popup-close-button')) {
            event = config.dismissUserInterviewPopupEvent
        } else if (targetElement.classList.contains('popup-book-button')) {
            event = config.clickBookButtonEvent
        } else {
            return
        }

        posthog.capture(event, {
            $set: {
                [`${config.userPropertyNameSeenUserInterview} - ${featureFlagName}`]: new Date().toISOString(),
                [config.userPropertyNameSeenUserInterview]: new Date().toISOString(),
            },
            featureFlagName: featureFlagName,
        })

        shadow.innerHTML = ''
        localStorage.setItem(sessionStorageName, 'true')

        // update the date that the last interview popup was shown
        localStorage.setItem(config.userPropertyNameSeenUserInterview, new Date().toISOString())
    })
}

export function inject({ config, posthog }: { config: Config; posthog: any }) {
    if (config.domains) {
        const domains = config.domains.split(',').map((domain) => domain.trim())
        if (domains.length > 0 && domains.indexOf(window.location.hostname) === -1) {
            return
        }
    }

    const lastPopupLongEnoughAgo =
        !localStorage.getItem(config.userPropertyNameSeenUserInterview) ||
        dateDiffFromToday(localStorage.getItem(config.userPropertyNameSeenUserInterview)) >=
            parseInt(config.minDaysSinceLastSeenPopUp)

    if (!DEBUG_SKIP_LAST_SEEN && !lastPopupLongEnoughAgo) return

    const shadow = createShadowDOM(style)

    // if DEBUG_SKIP_FEATURE_FLAG then show the popup for the first feature flag
    if (DEBUG_SKIP_FEATURE_FLAG) {
        createPopUp(posthog, config, shadow, 'https://calendly.com/example', 'Example Feature Flag')
        return
    }

    posthog.onFeatureFlags((flags) => {
        for (const flagName of flags) {
            const flagStartsWithKeyword = flagName.startsWith(config.flagStartsWith)
            const flagEnabled = posthog.isFeatureEnabled(flagName)
            const flagNotShownBefore = !localStorage.getItem(getFeatureSessionStorageKey(flagName))
            if (flagStartsWithKeyword && flagEnabled && flagNotShownBefore) {
                const payload = posthog.getFeatureFlagPayload(flagName)
                createPopUp(posthog, config, shadow, payload.bookingLink, flagName)
                return
            }
        }
    })
}
