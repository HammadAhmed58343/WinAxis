import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';

export default class WinAxisExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._timeoutId = null;

        // Register Ctrl+Alt+1 shortcut (Center)
        Main.wm.addKeybinding(
            'shortcut-center',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._positionWindow('center', false)
        );

        // Register Ctrl+Alt+2 shortcut (Center Right)
        Main.wm.addKeybinding(
            'shortcut-center-right',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._positionWindow('center-right', false)
        );

        // Register Ctrl+Alt+3 shortcut (Resize & Center)
        Main.wm.addKeybinding(
            'shortcut-resize-center',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._positionWindow('center', true)
        );
    }

    disable() {
        Main.wm.removeKeybinding('shortcut-center');
        Main.wm.removeKeybinding('shortcut-center-right');
        Main.wm.removeKeybinding('shortcut-resize-center');

        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }

        this._settings = null;
    }

    _centerWindow(resize) {
        this._positionWindow('center', resize);
    }

    _positionWindow(position, resize) {
        const window = global.display.focus_window;
        if (!window) {
            console.log("[WinAxis] No active window found");
            return;
        }

        // Check if window is maximized or tiled
        const isMaximized = (window.maximized_horizontally || window.maximized_vertically) || 
                            (typeof window.is_maximized === 'function' && window.is_maximized());
        
        if (isMaximized) {
            try {
                window.unmaximize();
            } catch (e) {
                console.log("[WinAxis] Error unmaximizing window:", e);
            }
            
            if (this._timeoutId) {
                GLib.Source.remove(this._timeoutId);
                this._timeoutId = null;
            }

            // Defer moving and resizing to allow the window to unmaximize first
            this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                this._doPositionWindow(window, position, resize);
                this._timeoutId = null;
                return GLib.SOURCE_REMOVE;
            });
        } else {
            this._doPositionWindow(window, position, resize);
        }
    }

    _doPositionWindow(window, position, resize) {
        const monitor = window.get_monitor();
        const workspace = window.get_workspace() || global.workspace_manager.get_active_workspace();
        const workArea = workspace.get_work_area_for_monitor(monitor);

        let targetWidth, targetHeight;
        if (resize) {
            const widthPct = this._settings.get_int('resize-width') || 80;
            const heightPct = this._settings.get_int('resize-height') || 70;
            targetWidth = Math.round(workArea.width * (widthPct / 100));
            targetHeight = Math.round(workArea.height * (heightPct / 100));
        } else {
            // Keep current width and height
            const rect = window.get_frame_rect();
            targetWidth = rect.width;
            targetHeight = rect.height;
        }

        let x, y;
        if (position === 'center-right') {
            x = Math.round(workArea.x + workArea.width - targetWidth);
            y = Math.round(workArea.y + (workArea.height - targetHeight) / 2);
        } else {
            // Default: center
            x = Math.round(workArea.x + (workArea.width - targetWidth) / 2);
            y = Math.round(workArea.y + (workArea.height - targetHeight) / 2);
        }

        // Clamp to ensure window remains inside workArea boundaries
        x = Math.max(workArea.x, x);
        y = Math.max(workArea.y, y);

        try {
            window.move_resize_frame(true, x, y, targetWidth, targetHeight);
        } catch (e) {
            console.log("[WinAxis] Error moving window:", e);
        }
    }
}
