# Energy profile function with n stages and smooth endpoints
energy_profile <- function(x, n_stages = 1, E_total = 80, delta_G = 40) {
  # x: reaction progress (0 to 1)
  # n_stages: number of intermediate steps
  # E_total: total activation energy height
  # delta_G: overall energy change
  
  if (n_stages == 1) {
    # Single barrier with smooth start/end using sine-based transition
    peak_position <- 0.5
    width <- 0.2
    
    # Gaussian peak
    gaussian <- E_total * exp(-((x - peak_position)^2) / (2 * width^2))
    
    # Smooth transition from 0 to delta_G using smoothstep function
    # This ensures zero derivative at boundaries
    smoothstep <- 3 * x^2 - 2 * x^3  # S-curve with zero derivatives at 0 and 1
    
    energy <- gaussian + delta_G * smoothstep
    
  } else {
    # Multiple barriers
    energy <- numeric(length(x))
    E_barrier <- E_total / (n_stages^0.7)
    width <- 0.8 / (n_stages * 2)
    
    # Place peaks evenly across reaction progress
    peak_positions <- seq(0.15, 0.85, length.out = n_stages)
    
    for (i in 1:n_stages) {
      # Add Gaussian peak for each intermediate
      energy <- energy + E_barrier * exp(-((x - peak_positions[i])^2) / (2 * width^2))
      
      # Add valleys between peaks
      if (i < n_stages) {
        valley_pos <- (peak_positions[i] + peak_positions[i+1]) / 2
        valley_depth <- E_barrier * 0.3
        energy <- energy - valley_depth * exp(-((x - valley_pos)^2) / (2 * (width*0.5)^2))
      }
    }
    
    # Smooth transition for overall trend
    smoothstep <- 3 * x^2 - 2 * x^3
    energy <- energy + delta_G * smoothstep
  }
  
  # Normalize to ensure start at 0 and end at delta_G
  energy_start <- energy[1]
  energy_end <- energy[length(energy)]
  
  # Shift to start at 0
  energy <- energy - energy_start
  
  # Scale to end at delta_G
  current_end <- energy[length(energy)]
  if (abs(current_end) > 1e-10) {
    energy <- energy * (delta_G / current_end)
  }
  
  # Apply additional smoothing at boundaries to ensure zero derivative
  boundary_smooth <- 20  # Number of points to smooth at each end
  
  if (length(x) > 2 * boundary_smooth) {
    # Smooth start
    for (i in 1:boundary_smooth) {
      weight <- (1 - cos(pi * (i-1) / boundary_smooth)) / 2  # Smooth transition
      energy[i] <- energy[i] * weight
    }
    
    # Smooth end
    for (i in 1:boundary_smooth) {
      idx <- length(energy) - boundary_smooth + i
      weight <- (1 - cos(pi * (boundary_smooth - i + 1) / boundary_smooth)) / 2
      energy[idx] <- delta_G + (energy[idx] - delta_G) * weight
    }
  }
  
  return(energy)
}
