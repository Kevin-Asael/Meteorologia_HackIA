using Microsoft.EntityFrameworkCore;
using Meteorologico_API.Models;

namespace Meteorologico_API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Location> Locations { get; set; }
        public DbSet<Param> Params { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Measurement> Measurements { get; set; }
        public DbSet<RecentValue> RecentValues { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // PostgreSQL es case-sensitive: columnas en Supabase están en minúsculas.
            ConfigureLocations(modelBuilder);
            ConfigureParams(modelBuilder);
            ConfigureTags(modelBuilder);
            ConfigureMeasurements(modelBuilder);
            ConfigureRecentValues(modelBuilder);
            ConfigureComments(modelBuilder);
        }

        private static void ConfigureLocations(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Location>(entity =>
            {
                entity.ToTable("locations");
                entity.HasKey(l => l.LocId);

                entity.Property(l => l.LocId).HasColumnName("locid");
                entity.Property(l => l.ParentLocId).HasColumnName("parentlocid");
                entity.Property(l => l.LocName).HasColumnName("locname");
                entity.Property(l => l.LocCode).HasColumnName("loccode");
                entity.Property(l => l.DaqCode).HasColumnName("daqcode");
            });
        }

        private static void ConfigureParams(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Param>(entity =>
            {
                entity.ToTable("params");
                entity.HasKey(p => p.ParId);

                entity.Property(p => p.ParId).HasColumnName("parid");
                entity.Property(p => p.ParCode).HasColumnName("parcode");
                entity.Property(p => p.ParName).HasColumnName("parname");
                entity.Property(p => p.Unit).HasColumnName("unit");
                entity.Property(p => p.DispFactor).HasColumnName("dispfactor");
                entity.Property(p => p.DispOffset).HasColumnName("dispoffset");
                entity.Property(p => p.DispUnit).HasColumnName("dispunit");
            });
        }

        private static void ConfigureTags(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.ToTable("tags");
                entity.HasKey(t => t.TagId);

                entity.Property(t => t.TagId).HasColumnName("tagid");
                entity.Property(t => t.LocId).HasColumnName("locid");
                entity.Property(t => t.ParId).HasColumnName("parid");
                entity.Property(t => t.TagName).HasColumnName("tagname");
                entity.Property(t => t.TagCode).HasColumnName("tagcode");
                entity.Property(t => t.LoLoLim).HasColumnName("lololim");
                entity.Property(t => t.LoLim).HasColumnName("lolim");
                entity.Property(t => t.HiLim).HasColumnName("hilim");
                entity.Property(t => t.HiHiLim).HasColumnName("hihilim");
                entity.Property(t => t.MinRange).HasColumnName("minrange");
                entity.Property(t => t.MaxRange).HasColumnName("maxrange");

                entity.HasOne(t => t.Location)
                    .WithMany(l => l.Tags)
                    .HasForeignKey(t => t.LocId);

                entity.HasOne(t => t.Param)
                    .WithMany(p => p.Tags)
                    .HasForeignKey(t => t.ParId);
            });
        }

        private static void ConfigureMeasurements(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Measurement>(entity =>
            {
                entity.ToTable("measurements");
                entity.HasKey(m => new { m.TagId, m.TimeOfMeasurement });

                entity.Property(m => m.TagId).HasColumnName("tagid");
                entity.Property(m => m.TimeOfMeasurement).HasColumnName("timeofmeasurement");
                entity.Property(m => m.MeasuredValue).HasColumnName("measuredvalue");

                entity.HasOne(m => m.Tag)
                    .WithMany(t => t.Measurements)
                    .HasForeignKey(m => m.TagId);
            });
        }

        private static void ConfigureRecentValues(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RecentValue>(entity =>
            {
                entity.ToTable("recentvalues");
                entity.HasKey(r => new { r.TagId, r.TimeOfMeasurement });

                entity.Property(r => r.TagId).HasColumnName("tagid");
                entity.Property(r => r.TimeOfMeasurement).HasColumnName("timeofmeasurement");
                entity.Property(r => r.MeasuredValue).HasColumnName("measuredvalue");

                entity.HasOne(r => r.Tag)
                    .WithMany(t => t.RecentValues)
                    .HasForeignKey(r => r.TagId);
            });
        }

        private static void ConfigureComments(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("comments");
                entity.HasKey(c => new { c.LocId, c.TimeOfComment });

                entity.Property(c => c.LocId).HasColumnName("locid");
                entity.Property(c => c.TimeOfComment).HasColumnName("timeofcomment");
                entity.Property(c => c.CommentText).HasColumnName("comment");

                entity.HasOne(c => c.Location)
                    .WithMany(l => l.Comments)
                    .HasForeignKey(c => c.LocId);
            });
        }
    }
}
