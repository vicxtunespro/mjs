
import { fetchStudents } from './student.repository';

describe('student.repository.fetchStudents', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns students data when API call is successful', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockStudents,
      }),
    });

    const result = await fetchStudents();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/students')
    );
    expect(result).toEqual(mockStudents);
  });

  it('throws an error when API call fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchStudents()).rejects.toThrow(
      'Failed to fetch students'
    );
  });
});
