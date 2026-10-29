/* Exploration projection only. Schedules, event priority and time remain in CityCore. */
(function(root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./data.js'));
  else root.CityTown = factory(root.CityCore, root.CityData);
})(globalThis, function(Core, Data) {
  'use strict';
  // All artwork, hit boxes, label pins and resident-row edges use this viewBox.
  const viewBox = Object.freeze({width:600, height:1040});
  const layout = {
    community: {x:28, y:58, width:225, height:204, labelX:140.5, labelY:262, peopleX:12, peopleY:268, align:'start'},
    library:   {x:376, y:174, width:188, height:145, labelX:472, labelY:310, peopleX:577, peopleY:320, align:'end'},
    market:    {x:8, y:364, width:190, height:152, labelX:116, labelY:510, peopleX:12, peopleY:518, align:'start'},
    park:      {x:278, y:410, width:295, height:200, labelX:424, labelY:600, peopleX:577, peopleY:610, align:'end'},
    cafe:      {x:65, y:701, width:173, height:165, labelX:156, labelY:866, peopleX:12, peopleY:878, align:'start'},
    mall:      {x:374, y:795, width:192, height:155, labelX:466, labelY:942, peopleX:577, peopleY:950, align:'end'}
  };
  const percent = (value, axis) => `${value / viewBox[axis] * 100}%`;
  // The market-to-park road is the narrowest corridor. Keep 4px of clearance
  // before the park hit box, without moving either anchor. Three portraits
  // still fit on narrow phones when no fourth (+N) target is needed.
  function portraitLimit(width, count) {
    const available = width * (layout.park.x - layout.market.peopleX) / viewBox.width;
    return count > 3 && available < 4 * 44 + 4 ? 2 : 3;
  }

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
  return {viewBox, layout, percent, portraitLimit, population};
});
