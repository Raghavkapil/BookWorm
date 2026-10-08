const prisma = require('../../config/db');

class AddressService {
  async listAddresses(userId) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async createAddress(userId, data) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    } else {
      const count = await prisma.address.count({ where: { userId } });
      if (count === 0) {
        data.isDefault = true;
      }
    }

    return prisma.address.create({
      data: {
        userId,
        recipientName: data.recipientName,
        phoneNumber: data.phoneNumber,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'India',
        isDefault: data.isDefault || false
      }
    });
  }

  async updateAddress(userId, addressId, data) {
    const id = parseInt(addressId, 10);
    const existing = await prisma.address.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== userId) {
      const error = new Error('Address not found');
      error.code = 'ADDRESS_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return prisma.address.update({
      where: { id },
      data
    });
  }

  async deleteAddress(userId, addressId) {
    const id = parseInt(addressId, 10);
    const existing = await prisma.address.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== userId) {
      const error = new Error('Address not found');
      error.code = 'ADDRESS_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    await prisma.address.delete({
      where: { id }
    });

    return { message: 'Address deleted successfully' };
  }
}

module.exports = new AddressService();
