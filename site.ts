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
            width: 380px;
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

export function inject({ config, posthog }) {
    if (config.domains) {
        const domains = config.domains.split(',').map((domain) => domain.trim())
        if (domains.length > 0 && domains.indexOf(window.location.hostname) === -1) {
            return
        }
    }
    const shadow = createShadow(style)

    const sessionStorageName = `${config.featureFlagName}-popupshown`

    function detectBookedInterview() {
        const urlParams = new URLSearchParams(window.location.search)
        const bookedUserInterview = urlParams.get('bookedUserInterview')
        if (bookedUserInterview) {
            posthog.capture('bookedUserInterview', { featureFlagName: bookedUserInterview })
        }
    }

    detectBookedInterview()

    function createPopUp() {
        posthog.capture(config.shownUserInterviewPopupEvent)
        const popupHTML = /*html*/ `
        <div class="popup" style="display: flex">
            <div class="userinterview-invitation">
                <h2 class="invitation-title">${config.invitationTitle}</h2>
                <div class="invitation-body">${config.invitationBody}</p>
            </div>
            <div class="bottom-section">
                <div class="buttons">
                    <button class="popup-close-button" type="button">
                        ${config.closeButtonText}
                    </button>
                    <button class="popup-book-button" onclick="window.open('${config.bookButtonURL}')">
                        ${config.bookButtonText}
                    </button>
                </div>
            </div>
        </div>`
        const popup = Object.assign(document.createElement('div'), {
            innerHTML: popupHTML,
        })
        shadow.appendChild(popup)
    }

    // if popup-close-button then remove popup
    shadow.addEventListener('click', (e) => {
        // @ts-ignore
        if (e.target.classList.contains('popup-close-button')) {
            posthog.capture(config.closedUserInterviewPopupEvent)
            shadow.innerHTML = ''
            localStorage.setItem(sessionStorageName, 'true')
            // @ts-ignore
        } else if (e.target.classList.contains('popup-book-button')) {
            posthog.capture(config.clickBookButtonEvent)
            shadow.innerHTML = ''
            localStorage.setItem(sessionStorageName, 'true')
        }
    })

    posthog.onFeatureFlags((flags) => {
        if (flags.includes(config.featureFlagName) && !localStorage.getItem(sessionStorageName)) {
            createPopUp()
        }
    })
}

function createShadow(style: string): ShadowRoot {
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
