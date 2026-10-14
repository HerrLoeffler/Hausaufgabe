export async function publishAuthProfileForGeneration({ readProfile, isCurrent, publishProfile }) {
  const profile = await readProfile();
  if (!isCurrent()) return null;
  publishProfile(profile);
  return profile;
}
