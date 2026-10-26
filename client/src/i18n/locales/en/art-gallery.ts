import { ArtGallerySimulationDictionary } from '../../types';

export const artGalleryEn: ArtGallerySimulationDictionary = {
  survey_title: 'Pre-Experiment Intuition Challenge',
  survey_desc: 'Estimate the minimal guards required before computational verification',
  sim_title: 'Interactive Art Gallery & Fisk Theorem Workbench',
  sim_desc:
    'Art gallery problem, ear-clipping polygon triangulation, and Steve Fisk’s 3-coloring theorem',
  guard_tip_title: 'Guard Placement Tip',
  guard_tip_body:
    'Click on room vertices (circles) or click anywhere in free space to place stationary guards. Observe real-time amber/emerald cones representing illuminated fields of vision!',
  preset_pentagon: 'Regular Pentagon (5 vertices)',
  preset_hexagon: 'Hexagon (6 vertices)',
  preset_comb: 'Chvátal Comb Polygon',
  preset_star: 'Star Polygon (Non-convex)',
  preset_names: {
    'chvatal-comb-3': 'Chvátal Comb Room (9 vertices)',
    'chvatal-comb-4': 'Large Comb Room (12 vertices)',
    'l-shaped': 'L-Shaped Room (6 vertices)',
    'convex-hexagon': 'Convex Hexagon (6 vertices)',
    'zigzag-hallway': 'Zigzag Hallway (10 vertices)',
  },
  custom_polygon: 'Draw Custom Polygon',
  triangulate_step: 'Triangulation (Ear-Clipping)',
  three_color_step: 'Graph 3-Coloring',
  guards_placed: 'Guards Placed',
  min_guards_theorem: 'Chvátal Theorem: At most ⌊n/3⌋ guards are always sufficient',
  fisk_theorem_title: 'Steve Fisk’s Elegant Proof (1978)',
  fisk_theorem_desc:
    'Every simple polygon can be triangulated into a 3-colorable graph. Choosing the least frequent color class (≤ ⌊n/3⌋) completely covers the art gallery.',
  ear_clipping_status: 'Ear-Clipping Algorithm Status',
  clear_polygon: 'Clear Polygon',
  presets_title: 'Classic Preset Gallery',
  presets_available: '{count} presets available',
  needs_guards: 'n = {vertices} • Needs ≥ {guards} guards',
  random_room_title: 'Generate Random Polygon Room',
  vertices_badge: 'n = {count} Vertices',
  simple_desc: 'Simple (fewer nooks)',
  complex_desc: 'Complex (more blind spots)',
  generate_btn: 'Generate Random Room ({count} Vertices)',
  placement_mode_title: 'Guard Placement Mode & Solutions',
  mode_vertices_only: 'Vertices Only',
  mode_anywhere: 'Anywhere in Room',
  auto_fisk_btn: 'Auto-place Guards (Fisk)',
  reset_default_btn: 'Reset to Default',
  canvas_title: 'Floor Plan & Visibility Field',
  mode_vertex_placement: 'Mode: Vertex Placement',
  mode_free_placement: 'Mode: Free Placement',
  vertices_count: 'Vertices',
  guards_count: 'Guards',
  chvatal_bound_label: 'Chvátal Bound: ',
  empty_vertex_guide: 'Click on any vertex (circle) to place a guard',
  empty_free_guide: 'Click anywhere inside the room or on vertices to place guards',
  fisk_legend_title: '3-Coloring by Steve Fisk Theorem:',
  color_amber: 'Amber Color',
  color_emerald: 'Emerald Color',
  color_indigo: 'Indigo Color',
  vertices_unit: 'vertices',
  minimal_bound_badge: 'Minimal ≤ ⌊n/3⌋',
  canvas_helper_hint: 'Click placed guard to remove | Click vertex to toggle guard',
  clear_all_guards_btn: 'Clear all guards',
  vertices_chvatal_title: 'Vertices & Chvátal Bound',
  current_guards_title: 'Current Guards Placed',
  lte_chvatal: '≤ Chvátal Bound',
  gt_chvatal: '> Chvátal Bound',
  coverage_title: 'Coverage Vision',
  security_status_title: 'Security Status',
  covered_100: '100% Covered',
  blind_spots_remain: 'Blind Spots Remain',
  no_blind_spots_desc: 'No blind spots remaining in room',
  need_more_guards_desc: 'Need more guards or better placement',
  fisk_stepper_title: 'Steve Fisk’s Step-by-Step Proof (1978)',
  fisk_stepper_subtitle:
    'Visual interactive walkthrough of the 5 phases of Fisk’s art gallery theorem proof',
  step_label: 'Step',
  triangles_count_label: 'Triangles: ',
  diagonals_count_label: 'Internal diagonals: ',
  prev_step: 'Previous step',
  next_step: 'Next step',
  color_a: 'Color A: ',
  color_b: 'Color B: ',
  color_c: 'Color C: ',
  pigeonhole_proof_note:
    'By the Pigeonhole Principle, at least one color appears at most ⌊n/3⌋ times. Placing guards at these vertices guarantees 100% room coverage!',
  fisk_steps: [
    {
      title: 'Step 0: Initial Room Survey',
      subtitle: 'Simple n-gon polygon with convex and reflex vertices',
      description:
        'The room may be intricate with many occluded alcoves. Chvátal’s Theorem guarantees that at most ⌊n/3⌋ vertex guards are ever required.',
    },
    {
      title: 'Step 1: Triangulation (Ear Clipping)',
      subtitle: 'Decomposing polygon into n - 2 triangles',
      description:
        'Connect vertices with non-crossing internal diagonals to partition the gallery into triangles. Every triangle is a convex set.',
    },
    {
      title: 'Step 2: 3-Coloring Vertices (Steve Fisk)',
      subtitle: 'Dual graph is a tree -> Always 3-colorable',
      description:
        'Assign 3 colors (Amber, Emerald, Indigo) to all vertices so that every triangle has vertices of 3 distinct colors.',
    },
    {
      title: 'Step 3: Pigeonhole Principle & Guard Placement',
      subtitle: 'Pick the least frequent color class (≤ ⌊n/3⌋)',
      description:
        'By the Pigeonhole Principle, at least one color appears at most ⌊n/3⌋ times. Place guards at all vertices of this color!',
    },
    {
      title: 'Step 4: 100% Comprehensive Coverage Verification',
      subtitle: 'Every triangle is covered by at least 1 guard',
      description:
        'Because every triangle contains one vertex of the selected color and triangles are convex, every triangle is fully illuminated -> 100% of the room is covered!',
    },
  ],
  explainer_sec1_title: '1. Problem Origin & Victor Klee’s Question (1973)',
  explainer_sec1_p1:
    'In 1973 at a Stanford math conference, mathematician Victor Klee posed a deceptively simple question to Václav Chvátal: "An art museum has n consecutive straight walls forming a simple n-gon. How many stationary guards are always sufficient to oversee every corner of the room, regardless of its shape?"',
  explainer_sec1_p2:
    'Shortly after in 1975, Václav Chvátal proved his eponymous theorem: exactly ⌊n/3⌋ guards are always sufficient and sometimes necessary.',
  explainer_sec2_title: '2. The Elegance of Steve Fisk’s Proof (1978)',
  explainer_sec2_p1:
    'Chvátal’s original proof used lengthy geometric induction. In 1978, Steve Fisk published an elegant proof spanning just one journal page, selected by Paul Erdős for "Proofs from THE BOOK":',
  explainer_point_triangulation_title: 'Polygon Triangulation:',
  explainer_point_triangulation_body:
    'Any simple n-gon can be partitioned into n - 2 triangles using n - 3 internal diagonals (Ear Clipping algorithm).',
  explainer_point_dual_title: 'Dual Graph is a Tree:',
  explainer_point_dual_body:
    'Treating each triangle as a node and shared edges as branches, the dual graph is an acyclic tree. Thus, the vertices of any triangulated polygon can always be 3-colored without adjacent vertices sharing a color.',
  explainer_point_pigeonhole_title: 'Pigeonhole Principle:',
  explainer_point_pigeonhole_body:
    'Partitioning n vertices into 3 color classes guarantees that the least frequent color class contains at most ≤ ⌊n/3⌋ vertices.',
  explainer_point_convex_title: 'Triangles are Convex Sets:',
  explainer_point_convex_body:
    'Every triangle contains all 3 colors, so each has at least one vertex in that minimal color group. A guard at any vertex of a convex triangle sees 100% of its area. The union of all triangles covers the entire gallery!',
  explainer_sec3_title: '3. Why Finding Minimal Guards for a Specific Room is NP-Hard?',
  explainer_sec3_subtitle:
    'We must clearly distinguish between two very different mathematical questions:',
  explainer_worst_case_title: '1. Worst-Case Bound (Guaranteed Safety)',
  explainer_worst_case_body:
    'Chvátal’s theorem guarantees that even for the most convoluted room (like combs), we never need more than ⌊n/3⌋ guards. Guard locations can be computed in O(n log n) time.',
  explainer_np_hard_title: '2. Specific Floor Plan Optimization (Minimum Guard)',
  explainer_np_hard_body:
    'Given a specific floor plan, finding the absolute minimum number of guards (e.g. 2 instead of 4 for a 12-gon) is NP-hard and APX-hard. No algorithm can find the exact optimum in polynomial time as n grows large.',
  report_title: '# Experimental Report: Art Gallery Problem',
  report_vertices: '- **Room Vertices (n)**: {n} vertices',
  report_chvatal: '- **Chvátal Theorem Bound (⌊n/3⌋)**: {bound} guards',
  report_guards: '- **Guards Placed**: {count} guards',
  report_coverage: '- **Coverage Percentage**: {pct}%',
  report_security_status: '- **Security Status**: {status}',
  report_status_full: '100% full coverage',
  report_status_blind: 'Blind spots remain',
  report_fisk:
    '- **Steve Fisk Algorithm (1978)**: Triangulated {triangles} triangles, 3-colored {colors}, selected minimum color group with {guardIndices} vertices.',
};
