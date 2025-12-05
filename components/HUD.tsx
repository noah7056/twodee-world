

import React from 'react';
import InventoryBar from './InventoryBar';
import FullInventory from './FullInventory';
import PauseMenu from './PauseMenu';
import SettingsMenu from './SettingsMenu';
import HowToPlay from './HowToPlay';
import { InventoryItem, Settings } from '../types';
import { Save } from 'lucide-react';

interface HUDProps {
    screen: string;
    settings: Settings;
    isInventoryOpen: boolean;
    setIsInventoryOpen: (v: boolean) => void;
    statusMessage: string | null;
    inventory: (InventoryItem | null)[];
    selectedItemIndex: number;
    setSelectedItemIndex: (i: number) => void;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    equipment: any;
    cursorStack: any;
    nearStation: boolean;
    nearbyContainerId: string | null;
    containerItems: any;
    handleCraft: any;
    handleInventoryAction: any;
    handleDropCursorItem: any;
    handleUseItem: any;
    moveItemLegacy: any;
    setScreen: (s: any) => void;
    handleUpdateSettings: any;
    handleQuitRequest: any;
    isSaving?: boolean;
}

const HUD: React.FC<HUDProps> = (props) => {
    const { settings, screen, statusMessage, isInventoryOpen, setIsInventoryOpen, isSaving } = props;

    // CSS Transform for GUI Scaling
    const uiTransform = {
        transform: `scale(${settings.guiScale})`,
        transformOrigin: 'top center',
        width: `${100 / settings.guiScale}%`,
        height: `${100 / settings.guiScale}%`,
        position: 'absolute' as 'absolute',
        top: 0,
        left: '50%',
        marginLeft: `-${50 / settings.guiScale}%`,
        pointerEvents: 'none' as 'none',
        zIndex: 10
    };

    return (
        <div style={uiTransform}>
            <div style={{ pointerEvents: 'auto', width: '100%', height: '100%', position: 'relative' }}>
                {statusMessage && (
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 pointer-events-none z-30">
                        <div className="bg-black/60 text-white px-6 py-2 rounded-full backdrop-blur text-lg animate-bounce border border-white/10" role="alert">
                            {statusMessage}
                        </div>
                    </div>
                )}
                
                {isSaving && (
                    <div className="fixed bottom-4 right-4 pointer-events-none z-40 flex items-center gap-2 text-white/70 animate-pulse">
                        <Save size={20} />
                        <span className="text-sm font-bold uppercase tracking-widest">Saving...</span>
                    </div>
                )}

                {!isInventoryOpen && screen === 'game' && (
                    <InventoryBar 
                        inventory={props.inventory} 
                        selectedIndex={props.selectedItemIndex} 
                        onSelect={props.setSelectedItemIndex}
                        onMoveItem={props.moveItemLegacy}
                        onUseItem={props.handleUseItem}
                        health={props.health}
                        maxHealth={props.maxHealth}
                        stamina={props.stamina}
                        maxStamina={props.maxStamina}
                    />
                )}

                <FullInventory 
                    isOpen={isInventoryOpen}
                    onClose={() => setIsInventoryOpen(false)}
                    inventory={props.inventory}
                    containerItems={props.nearbyContainerId ? props.containerItems : null}
                    onCraft={props.handleCraft}
                    nearStation={props.nearStation}
                    onInventoryAction={props.handleInventoryAction}
                    health={props.health}
                    maxHealth={props.maxHealth}
                    stamina={props.stamina}
                    maxStamina={props.maxStamina}
                    equipment={props.equipment}
                    cursorStack={props.cursorStack}
                    onDropCursor={props.handleDropCursorItem}
                />

                {screen === 'paused' && (
                    <PauseMenu 
                        onResume={() => props.setScreen('game')}
                        onHowToPlay={() => props.setScreen('howto_ingame')}
                        onSettings={() => props.setScreen('settings_ingame')}
                        onQuit={props.handleQuitRequest}
                    />
                )}

                {screen === 'settings_ingame' && (
                    <SettingsMenu
                        settings={settings}
                        onSave={props.handleUpdateSettings}
                        onBack={() => props.setScreen('paused')}
                    />
                )}

                {screen === 'howto_ingame' && (
                    <HowToPlay onBack={() => props.setScreen('paused')} />
                )}
            </div>
        </div>
    );
};

export default HUD;