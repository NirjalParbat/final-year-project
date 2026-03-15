import Package from '../models/Package.model.js';

// @desc    Get all packages (with search/filter)
// @route   GET /api/packages
export const getPackages = async (req, res) => {
  try {
    const {
      search, category, country, minPrice, maxPrice,
      minDuration, maxDuration, minRating, featured,
      sort = '-createdAt', page = 1, limit = 9,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (country) query.country = { $regex: country, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = Number(minDuration);
      if (maxDuration) query.duration.$lte = Number(maxDuration);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (featured === 'true') query.featured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Package.countDocuments(query);
    const packages = await Package.find(query).sort(sort).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      packages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create package (admin)
// @route   POST /api/packages
export const createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, message: 'Package created', package: pkg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update package (admin)
// @route   PUT /api/packages/:id
export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package updated', package: pkg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete package (admin)
// @route   DELETE /api/packages/:id
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle wishlist
// @route   POST /api/packages/:id/wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const user = req.user;
    const packageId = req.params.id;

    const index = user.wishlist.findIndex((id) => id.toString() === packageId.toString());
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(packageId);
    }
    await user.save();

    res.json({
      success: true,
      message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured packages
// @route   GET /api/packages/featured
export const getFeaturedPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true, featured: true }).limit(6);
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
