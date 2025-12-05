

import React, { useState, useEffect } from 'react';
import GameEngine from './components/GameEngine';
import MainMenu from './components/MainMenu';
import HowToPlay from './components/HowToPlay';
import WorldSelectMenu from './components/WorldSelectMenu';
import SettingsMenu from './components/SettingsMenu';
import HUD from './components/HUD';
import { InventoryItem, SaveData, Settings } from './types';
import { INVENTORY_SIZE, DEFAULT_SETTINGS } from './constants';
import { loadSave, saveGame, createSave, loadSettings, saveSettings } from './utils/storageUtils';
import { setWorldConfig, getRandomConfig } from './utils/gameUtils';
import { useInventoryManager } from './hooks/useInventoryManager';

type ScreenState = 'menu' | 'world_select' | 'game' | 'paused' | 'howto' | 'howto_ingame' | 'settings' | 'settings_ingame';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('menu');

  // Persistence State
  const [currentSaveSlot, setCurrentSaveSlot] = useState<number | null>(null);
  const [initialGameData, setInitialGameData] = useState<SaveData | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Stats
  const [health, setHealth] = useState(100);
  const [stamina, setStamina] = useState(100);
  const MAX_HEALTH = 100;
  const MAX_STAMINA = 100;

  // UI State
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [nearStation, setNearStation] = useState(false);
  const [nearbyContainerId, setNearbyContainerId] = useState<string | null>(null);
  const [containerItems, setContainerItems] = useState<(InventoryItem | null)[] | null>(null);
  const [respawnTrigger, setRespawnTrigger] = useState(0);
  const [saveSignal, setSaveSignal] = useState(0);
  const [isQuitting, setIsQuitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inventory Management Hook
  const {
      inventory, setInventory,
      equipment, setEquipment,
      cursorStack, setCursorStack,
      dropAction, setDropAction,
      handleUseItem,
      handleCraft,
      handleInventoryAction
  } = useInventoryManager(
      Array(INVENTORY_SIZE).fill(null),
      { head: null, body: null, accessory: null, bag: null },
      MAX_HEALTH, MAX_STAMINA, setHealth, setStamina, (msg) => setStatusMessage(msg)
  );

  // Load Settings
  useEffect(() => { setSettings(loadSettings()); }, []);

  const handleUpdateSettings = (newSettings: Settings) => {
      setSettings(newSettings);
      saveSettings(newSettings);
  };

  // Game Handlers
  const handleContainerNearby = (id: string | null, items: (InventoryItem | null)[] | null) => {
      if (isInventoryOpen && id === nearbyContainerId && items === null) return;
      setNearbyContainerId(id);
      if (!isInventoryOpen || (id && id !== nearbyContainerId)) setContainerItems(items);
      else if (id === null) setContainerItems(null);
  };

  const handleDeath = () => {
      setHealth(MAX_HEALTH); setStamina(MAX_STAMINA);
      setInventory(Array(INVENTORY_SIZE).fill(null));
      setEquipment({ head: null, body: null, accessory: null, bag: null });
      setSelectedItemIndex(0); setCursorStack(null);
      setStatusMessage("You Died! Inventory Lost.");
      setRespawnTrigger(prev => prev + 1); setIsInventoryOpen(false);
  };

  const handleDropCursorItem = () => {
      if (cursorStack) { setDropAction(cursorStack); setCursorStack(null); }
  };

  // Save/Load Logic
  const handleSelectWorld = (slotId: number) => {
      setCurrentSaveSlot(slotId);
      let data = loadSave(slotId);
      if (!data) data = createSave(slotId, `World ${slotId}`);
      
      if (data.world.seedConfig) setWorldConfig(data.world.seedConfig);
      else { const newConfig = getRandomConfig(); data.world.seedConfig = newConfig; setWorldConfig(newConfig); }
      
      setHealth(data.player.health); setStamina(data.player.stamina);
      setInventory(data.player.inventory); setEquipment(data.player.equipment);
      setInitialGameData(data);
      setScreen('game'); setIsInventoryOpen(false);
  };

  const handleGameSave = (worldData: any) => {
      if (currentSaveSlot === null) return;
      const currentMeta = loadSave(currentSaveSlot)?.meta || { id: currentSaveSlot, name: `World ${currentSaveSlot}`, lastPlayed: Date.now() };
      const saveData: SaveData = {
          meta: currentMeta,
          player: {
              x: worldData.playerX, y: worldData.playerY,
              health: health, stamina: stamina,
              inventory: inventory, equipment: equipment,
              rotation: worldData.rotation,
              poisonTimer: worldData.poisonTimer || 0
          },
          world: { chunks: worldData.chunks, saplings: worldData.saplings, seedConfig: initialGameData?.world.seedConfig || getRandomConfig() },
          camera: { x: worldData.camX, y: worldData.camY }
      };
      saveGame(currentSaveSlot, saveData);
      if (isQuitting) { setScreen('menu'); setInitialGameData(null); setIsQuitting(false); setSaveSignal(0); }
  };

  const handleAutoSave = () => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 2000); // Hide icon after 2 seconds
  };

  const handleQuitRequest = () => { setIsQuitting(true); setSaveSignal(prev => prev + 1); };

  // Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (['menu', 'howto', 'world_select', 'settings'].includes(screen)) return;
        if (e.key === 'Escape') {
            if (screen === 'game') isInventoryOpen ? setIsInventoryOpen(false) : setScreen('paused');
            else if (screen === 'paused') setScreen('game');
            else if (['howto_ingame', 'settings_ingame'].includes(screen)) setScreen('paused');
            return;
        }
        if (screen === 'paused') return;
        if (e.key.toLowerCase() === settings.keybinds.inventory) setIsInventoryOpen(prev => !prev);
        const keyNum = parseInt(e.key);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 8) setSelectedItemIndex(keyNum - 1);
    };

    const handleWheel = (e: WheelEvent) => {
        if (screen !== 'game' || isInventoryOpen) return;
        setSelectedItemIndex(prev => {
            const next = prev + (e.deltaY > 0 ? 1 : -1);
            return next >= 8 ? 0 : next < 0 ? 7 : next;
        });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('wheel', handleWheel); };
  }, [isInventoryOpen, screen, settings.keybinds]);

  useEffect(() => { if (statusMessage) { const t = setTimeout(() => setStatusMessage(null), 3000); return () => clearTimeout(t); } }, [statusMessage]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans select-none">
      {screen === 'menu' && <MainMenu onPlay={() => setScreen('world_select')} onHowToPlay={() => setScreen('howto')} onSettings={() => setScreen('settings')}/>}
      {screen === 'world_select' && <WorldSelectMenu onBack={() => setScreen('menu')} onSelectWorld={handleSelectWorld}/>}
      {screen === 'howto' && <HowToPlay onBack={() => setScreen('menu')} />}
      {screen === 'settings' && <SettingsMenu settings={settings} onSave={handleUpdateSettings} onBack={() => setScreen('menu')}/>}

      {['game', 'paused', 'howto_ingame', 'settings_ingame'].includes(screen) && (
          <>
            <GameEngine 
                inventory={inventory} 
                onInventoryUpdate={setInventory}
                onStatusUpdate={setStatusMessage}
                onStationUpdate={setNearStation}
                onContainerNearby={handleContainerNearby}
                activeContainer={nearbyContainerId && containerItems ? { id: nearbyContainerId, items: containerItems } : null}
                onStatsUpdate={(hp, stam) => { setHealth(hp); setStamina(stam); }}
                onDeath={handleDeath}
                selectedItemIndex={selectedItemIndex}
                setSelectedItem={setSelectedItemIndex}
                isInventoryOpen={isInventoryOpen}
                currentHealth={health}
                currentStamina={stamina}
                respawnTrigger={respawnTrigger}
                equipment={equipment}
                onEquipmentUpdate={setEquipment}
                dropAction={dropAction}
                onDropActionHandled={() => setDropAction(null)}
                isPaused={screen !== 'game'}
                initialData={initialGameData}
                onSave={handleGameSave}
                onAutoSave={handleAutoSave}
                saveSignal={saveSignal}
                settings={settings}
                onToggleInventory={() => setIsInventoryOpen(prev => !prev)}
            />
            
            <HUD 
                screen={screen}
                settings={settings}
                isInventoryOpen={isInventoryOpen}
                setIsInventoryOpen={setIsInventoryOpen}
                statusMessage={statusMessage}
                inventory={inventory}
                selectedItemIndex={selectedItemIndex}
                setSelectedItemIndex={setSelectedItemIndex}
                health={health}
                maxHealth={MAX_HEALTH}
                stamina={stamina}
                maxStamina={MAX_STAMINA}
                equipment={equipment}
                cursorStack={cursorStack}
                nearStation={nearStation}
                nearbyContainerId={nearbyContainerId}
                containerItems={containerItems}
                handleCraft={handleCraft}
                handleInventoryAction={(context: any, index: any, button: any) => handleInventoryAction(context, index, button, containerItems, setContainerItems)}
                handleDropCursorItem={handleDropCursorItem}
                handleUseItem={handleUseItem}
                moveItemLegacy={(f: number, t: number) => { 
                    const n = [...inventory]; const tmp = n[f]; n[f] = n[t]; n[t] = tmp; setInventory(n); 
                }}
                setScreen={setScreen}
                handleUpdateSettings={handleUpdateSettings}
                handleQuitRequest={handleQuitRequest}
                isSaving={isSaving}
            />
          </>
      )}
    </div>
  );
};

export default App;