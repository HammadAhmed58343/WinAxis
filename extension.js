import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';

export default class WindowCentererExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        // Register Ctrl+Alt+1 shortcut
        Main.wm.addKeybinding(
            'shortcut-center',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._centerWindow(false)
        );

        // Register Ctrl+Alt+3 shortcut
        Main.wm.addKeybinding(
            'shortcut-resize-center',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._centerWindow(true)
        );
    }

    disable() {
        Main.wm.removeKeybinding('shortcut-center');
        Main.wm.removeKeybinding('shortcut-resize-center');
        this._settings = null;
    }

    _centerWindow(resize) {
        const window = global.display.focus_window;
        if (!window) {
            console.log("[Window Centerer] No active window found");
            return;
        }

        // Check if window is maximized
        const isMaximized = (window.maximized_horizontally && window.maximized_vertically) || 
                            (typeof window.is_maximized === 'function' && window.is_maximized());
        
        if (isMaximized) {
            try {
                window.unmaximize();
            } catch (e) {
                console.log("[Window Centerer] Error unmaximizing window:", e);
            }
            
            // Defer moving and resizing to allow the window to unmaximize first
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                this._doCenterWindow(window, resize);
                return GLib.SOURCE_REMOVE;
            });
        } else {
            this._doCenterWindow(window, resize);
        }
    }

    _doCenterWindow(window, resize) {
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

        const x = Math.round(workArea.x + (workArea.width - targetWidth) / 2);
        const y = Math.round(workArea.y + (workArea.height - targetHeight) / 2);

        try {
            window.move_resize_frame(true, x, y, targetWidth, targetHeight);
        } catch (e) {
            console.log("[Window Centerer] Error moving window:", e);
        }
    }
}
