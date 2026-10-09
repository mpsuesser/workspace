# Portrait audit and production reference

This is an operational synthesis. Source IDs point to [SOURCES.md](SOURCES.md); diagnostic sizes and priority categories below are practical choices, not experimentally established thresholds.

## 1. Establish an inspection set

Use the original image when possible, plus the current avatar and a screenshot of its real placement. Inspect:

- **Large view:** focus, exposure, likeness, retouching, hair/edge artifacts, distractions.
- **Square and circular crops:** clipping, headroom, shoulder balance, peripheral details lost to the mask.
- **Small views:** approximately 32, 48, and 96 pixels as diagnostic fixtures. A portrait that works at 96 may collapse at 32. Actual rendered sizes vary by surface and device.
- **Context:** light/dark surroundings and, if available, the feed, reply, profile, or notification placement where the portrait will appear.

Normalize candidate display sizes and label originals versus edited variants. A full-size photo beside somebody else's tiny screenshot is not a fair comparison. Preserve each candidate's best plausible crop for a final selection; use identical crops when testing a particular crop-independent variable.

If tools cannot produce scaled images, assess likely thumbnail behavior from the available view and disclose that limit. Never claim pixel-level, metadata, or export checks from a visual estimate.

## 2. Legibility: solve this first

### Face and framing

**Inspect:** whether the face is immediately identifiable, how much of the image is spent on irrelevant surroundings, and whether the circle cuts through important features. Head-and-shoulders is a useful starting point; a torso crop can work when the expression remains legible. [AC01, GK01, GK02, PF01]

**Possible actions:** tighten an overly distant crop; move the crop to protect the head and chin; remove an object that competes with the face; choose a sharper source. There is no sourced universal face-fill percentage.

**Tradeoff:** a close crop improves recognition but may remove meaningful posture or feel cramped. Kawasaki's asymmetry guidance is a compositional option, subordinate to circle-safe framing and tiny-size clarity.

### Light, eyes, and separation

**Inspect:** whether the eyes and expression remain readable; whether harsh backlight, blocked shadows, glare, or blur obscure them; and whether hair/face/clothing merge into the background.

**Possible actions:** photograph facing soft window light; change the light angle to reduce glasses glare; simplify the background; adjust local exposure modestly; choose a version with better tonal separation. Clean the lens and use stable support when reshooting. [GK01, GK02, SOP02]

**Tradeoff:** dramatic lighting can be a useful brand choice if the identity still reads. A darker image is not automatically defective. Judge the displayed result rather than prescribing uniform brightness.

### Background and contrast

**Inspect:** clutter at thumbnail size, distracting lines behind the head, competing faces/text, and contrast against both the image background and the surrounding interface.

**Possible actions:** use a cleaner location, a more distant background, a different crop, or restrained background editing. Check both color and tonal separation.

**Evidence boundary:** Crestodina recommends simplicity and contrasting color; Photofeeler found no significant background-setting effect in its analysis. These address different questions: miniature readability versus aggregate trait ratings. A natural background can work very well. No color is universally optimal. [AC01, PF01, CS01]

## 3. Audience fit: choose an impression deliberately

Ask what the portrait should convey in this context: approachable peer, thoughtful writer, energetic teacher, established adviser, playful maker, or another user-defined intention. These are communication goals, not personality diagnoses. Welsh explicitly treats different emotional impressions as legitimate choices. [JW01, JW02]

### Expression

- A relaxed smile can support warmth and approachability. Teeth-showing smiles rated well in Photofeeler's professional-impression dataset. [PF01]
- A neutral or serious expression may better fit a contemplative, restrained, or authoritative presentation. Test it when approachability is central to the user's goal.
- A large laughing expression may communicate energy while shifting perceived professional authority; use the actual audience and context to decide.
- Avoid mechanically coaching a “squinch” into an unnatural expression. The reported association is a hypothesis to test, not a requirement or proof of confidence.

Describe visible cues: “the smile reads more readily in this crop” or “the eyes are difficult to see at feed size.” Avoid “this person is more trustworthy.”

### Gaze and pose

Direct gaze is a useful candidate for an immediately engaging portrait. Off-camera gaze may support an editorial or reflective style. Tweet Hunter's own examples include such exceptions; its description of Koe's portrait is not Koe's advice. [TH01]

Compare poses with relaxed shoulders and natural expression before asking for elaborate gestures. Hands and props consume scarce pixels; retain them when they serve the intended identity and remain readable.

### Clothes, setting, and production style

Choose clothes and surroundings that make sense for the user's work and audience. Formal dress improved certain professional ratings in PF01; that does not mean every artist, developer, or independent creator should wear a suit.

A professional photographer can improve consistency and direction. A competent phone portrait can also be sufficient. Welsh explicitly allows both, and both Welsh and Koe argue for stage-appropriate investment. [JW02, JW03, DK06]

**Complete audience-fit finding:** name the intended impression, the cue that supports or conflicts with it, and whether the conclusion is an observation or an audience-response hypothesis.

## 4. Distinctiveness: recognizable without visual noise

Look for one or two cues that survive reduction: a consistent silhouette, simple color field, monochrome treatment, recognizable hairstyle, lighting style, or characteristic expression. These are possibilities, not a required checklist.

Koe's aesthetic guidance centers on taste, feeling, and the overall experience. His “clickable profile picture” instruction does not specify a color, crop, smile, or conversion formula. Translate it into a candidate that is identifiable and inviting in context, and label that translation as synthesis. [DK01, DK03]

### Monochrome versus color

Monochrome can simplify the image and support a coherent visual identity. Color can improve separation or reinforce a distinctive palette. PF01 did not find a significant B&W effect in its dataset. Compare both when the choice is consequential; account for existing recognition before changing an established treatment.

### Brand cues

Subtle background color, clothing, or location can reinforce a brand. A small embedded logo or slogan often disappears at feed size. Assess the actual preview rather than adding decoration because it sounds like branding. [AC01]

Compare with nearby accounts to detect accidental sameness, not to imitate the largest creator's face, treatment, or style. Current portraits are observational examples unless accompanied by directly sourced explanations.

## 5. Continuity: recognition compounds through exposure

Assess whether followers can recognize the person across replies, posts, platforms, and profile visits. Koe explicitly describes people becoming familiar with a face/profile picture through prior engagement. Crestodina recommends consistent professional headshots, while Fitzpatrick recommends maintaining an inventory of profiles when changing them. [DK04, AC01, PEF01]

The same image is a practical default across professional accounts serving the same identity. Different platform crops or audience-specific photos can work if the recognizable identity remains coherent. Treat a private account or intentionally separate persona as a different context.

An established portrait carries a switching cost. Change it when there is a meaningful benefit: poor legibility, outdated likeness, an intentional positioning change, or a substantially stronger candidate. Crestodina's year-or-two advice is a recognition heuristic, not a calendar mandate.

Assess the portrait beside the banner, bio, and content when those are supplied. Koe describes brand as the accumulated environment and ideas people encounter, not simply the photo. Keep a portrait audit focused; report an obvious profile mismatch without expanding into an unsolicited full rebrand. [DK07, DK08]

## 6. Authenticity and technical readiness

Favor a recognizable current likeness, natural texture, plausible anatomy, and edits that survive close inspection. Assess visible artifacts: inconsistent eyes or teeth, malformed glasses/jewelry, cutout halos, mismatched lighting, or over-smoothed skin. These are quality concerns, not proof of an image's origin.

Welsh includes AI tools among production options; this is not evidence that generated headshots outperform photography. For generated or heavily edited candidates, ask whether the person considers the likeness faithful when that cannot be established from the supplied material. [JW02]

For delivery, check the actual file's dimensions, type, and size with suitable tools. Keep a high-quality source and create destination-specific exports. Technical requirements and update checks live in [TESTING-AND-PLATFORMS.md](TESTING-AND-PLATFORMS.md).

## 7. Turn findings into an edit or shot brief

### Priority guide

- **Fix first:** face too small to identify, unusable blur, important facial features clipped, distracting artifacts, or failed upload requirements.
- **Improve next:** clutter, weak separation, or a presentation that conflicts with the intended audience impression.
- **Test if useful:** smile versus neutral, direct versus off-camera gaze, color versus monochrome, subtle stylistic differences.
- **Keep:** effective existing cues whose replacement is speculative.

These categories organize work; they are not a psychometric score.

### Useful brief format

> Preserve [effective identity cues]. Change [specific crop/light/background issue]. Shoot or edit [two or three concrete variants]. Evaluate them as circular thumbnails and in [target context]. Choose based on [specific audience impression or recognition question].

Example, explicitly hypothetical:

> Keep the monochrome treatment and relaxed expression. The face currently occupies too little of the circle, so first try a tighter head-and-shoulders crop. If the eyes remain lost in shadow, reshoot facing a window and capture both a slight smile and a relaxed neutral expression. Compare both at reply size before changing the established avatar.

### Confidence language

- **High:** directly visible defect or verified file requirement.
- **Medium:** plausible presentation effect supported by a relevant source and the supplied context.
- **Low / test needed:** audience preference, stylistic tie, or downstream conversion prediction.

Keep growth claims separate: an excellent thumbnail may improve a first impression, but the account's content, offer, exposure, and audience also influence follows.
