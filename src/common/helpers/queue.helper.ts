import { Logger } from '@nestjs/common';
import { JobInformation, JobOptions, Queue } from 'bull';

/**
 * It removes all repeatable jobs with a given id from a given queue
 * @param {Queue} queue - Queue - the queue instance
 * @param {string} jobId - The id of the job you want to remove.
 * @returns An object with two properties: jobs and removed.
 */
export const removeDanglingRepeatableJobs = async (
  queue: Queue,
  jobId: string,
): Promise<{ jobs: JobInformation[]; removed: JobInformation[] }> => {
  const jobs = await queue.getRepeatableJobs();
  const matches = jobs.filter((job) => job.id === jobId);

  if (matches.length <= 1) {
    return { jobs, removed: [] };
  }

  await Promise.all(matches.map((job) => queue.removeRepeatableByKey(job.key)));

  return { jobs, removed: matches };
};

export const scheduleRepeatableJob = async <T>(
  queue: Queue,
  jobId: string,
  jobSchedulerId: string,
  options: JobOptions,
  logger: Logger,
  data?: T,
): Promise<void> => {
  const { removed } = await removeDanglingRepeatableJobs(queue, jobSchedulerId);

  if (removed.length > 0) {
    logger.warn(`Removed ${removed.length} jobs from the queue [${jobId}]. `);
  }

  await queue.add(jobId, data, {
    jobId: jobSchedulerId,
    ...options,
  });
  logger.verbose(`Job [${jobId}] was scheduled to the queue by [${jobSchedulerId}]. `);
};
