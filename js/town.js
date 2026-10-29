/* Exploration projection only. Schedules, event priority and time remain in CityCore. */
(function(root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./data.js'));
  else root.CityTown = factory(root.CityCore, root.CityData);
})(globalThis, function(Core, Data) {
  'use strict';
  // Coordinates share the decorative SVG's 600 × 1040 viewBox. No game data lives here.
  const layout = {
    community: {x:28, y:58, width:225, height:204, peopleX:142, peopleY:284},
    library:   {x:367, y:174, width:210, height:167, peopleX:471, peopleY:365},
    market:    {x:16, y:364, width:210, height:174, peopleX:116, peopleY:561},
    park:      {x:278, y:440, width:290, height:180, peopleX:424, peopleY:646},
    cafe:      {x:49, y:702, width:215, height:164, peopleX:156, peopleY:890},
    mall:      {x:350, y:797, width:232, height:149, peopleX:466, peopleY:970}
  };

  function population(state) {
    Core.prepare(state); // Existing once-per-day roll; never roll a separate map schedule.
    const places = Data.PLACES.map(place => ({...place, present:[], visible:[]}));
    const byId = new Map(places.map(place => [place.id, place]));
    for (const character of state.characters) {
      const status = Core.statusAt(state, character, state.day, state.slot);
      const place = byId.get(status.location);
      if (!place) continue; // Home/office are not explorable destinations.
      const resident = {character, status};
      place.present.push(resident); // Preserve the existing encounter/refusal UI.
      // Busy work, family duties and emergencies cannot advertise an encounter.
      // Event availability is still decided by Core.begin/available after entering.
      if (!status.busy) place.visible.push(resident);
    }
    return places;
  }
  return {layout, population};
});
