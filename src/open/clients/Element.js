/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {Maturity, Platform, LinkKind,
    FDroidLink, AppleStoreLink, PlayStoreLink, WebsiteLink} from "../types.js";

const trustedWebInstances = [
    "web.wepoc.co"  // first one is the default one
];

/**
 * Information on how to deep link to a given matrix client.
 */
export class Element {
    get id() { return "wepoc.co"; }

    get platforms() {
        return [
            Platform.iOS,
            Platform.DesktopWeb
            //, Platform.Android
        ];
    }

    get icon() { return "images/client-icons/wepoc.png"; }
    get appleAssociatedAppId() { return "649RMX27J7.com.wepoc2.app"; }
    get name() {return "Wepoc"; }
    get description() { return 'Our Official App, used by millions.'; }
    get homepage() { return "https://wepoc.co"; }
    get author() { return "Wepoc"; }
    getMaturity(platform) { return Maturity.Stable; }

    getDeepLink(platform, link) {
        let fragmentPath;
        switch (link.kind) {
            case LinkKind.User:
                fragmentPath = `user/${encodeURIComponent(link.identifier)}`;
                break;
            case LinkKind.Room:
                fragmentPath = `room/${encodeURIComponent(link.identifier)}`;
                break;
            case LinkKind.Group:
                fragmentPath = `group/${encodeURIComponent(link.identifier)}`;
                break;
            case LinkKind.Event:
                fragmentPath = `room/${encodeURIComponent(link.identifier)}/${encodeURIComponent(link.eventId)}`;
                break;
        }

        if ((link.kind === LinkKind.Event || link.kind === LinkKind.Room) && link.servers.length > 0) {
            fragmentPath += '?' + link.servers.map(server => `via=${encodeURIComponent(server)}`).join('&');
        }

        const isWebPlatform = platform === Platform.DesktopWeb || platform === Platform.MobileWeb;
        if (isWebPlatform || platform === Platform.iOS) {
            let instanceHost = trustedWebInstances[0];
            // we use app.element.io which iOS will intercept, but it likely won't intercept any other trusted instances
            // so only use a preferred web instance for true web links.
            if (isWebPlatform && trustedWebInstances.includes(link.webInstances[this.id])) {
                instanceHost = link.webInstances[this.id];
            }
            return `https://${instanceHost}/#/${fragmentPath}`;
        } else if (platform === Platform.Linux || platform === Platform.Windows || platform === Platform.macOS) {
            return `element://vector/webapp/#/${fragmentPath}`;
        } else {
            return `element://${fragmentPath}`;
        }
    }

    getLinkInstructions(platform, link) {}
    getCopyString(platform, link) {}
    getInstallLinks(platform) {
        switch (platform) {
            case Platform.iOS: return [new AppleStoreLink('Wepoc', 'id6450281997')];
            case Platform.Android: return [new PlayStoreLink('im.vector.app'), new FDroidLink('im.vector.app')];
            default: return [new WebsiteLink("https://element.io/download")];
        }
    }

    canInterceptMatrixToLinks(platform) {
        return platform === Platform.Android;
    }

    getPreferredWebInstance(link) {
        const idx = trustedWebInstances.indexOf(link.webInstances[this.id])
        return idx === -1 ? undefined : trustedWebInstances[idx];
    }
}
